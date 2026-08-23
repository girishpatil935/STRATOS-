"""Gemini implementation of the provider contract using Google GenAI SDK."""

import asyncio
import hashlib
import json
import re
import time
from typing import Any

from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.core.logging import get_logger
from app.schemas.research import AIAnalysisOutput
from app.services.ai.base import AIProviderError, BaseAIProvider, QuotaExhaustedError

logger = get_logger(__name__)

# Default retry settings
DEFAULT_RETRY_DELAY_SECONDS = 4.0
MAX_ALLOWED_RETRY_DELAY_SECONDS = 15.0


class GeminiProvider(BaseAIProvider):
    """Centralized Gemini provider with pacing, rate limiting, caching, and quota protection."""

    _cache: dict[str, AIAnalysisOutput] = {}
    gemini_quota_exhausted: bool = False
    _last_request_finish_time: float = 0.0
    _consecutive_quota_errors: int = 0
    _circuit_breaker_active: bool = False

    def __init__(
        self,
        api_key: str | None,
        model: str,
        timeout_seconds: int | None = None,
        inter_request_delay_seconds: float | None = None,
        max_consecutive_quota_errors: int | None = None,
    ) -> None:
        settings = get_settings()
        self.api_key = api_key
        self.model = model
        self.timeout_seconds = (
            timeout_seconds
            if timeout_seconds is not None
            else settings.ai_request_timeout_seconds
        )
        self.inter_request_delay_seconds = (
            inter_request_delay_seconds
            if inter_request_delay_seconds is not None
            else settings.gemini_request_delay_seconds
        )
        self.max_consecutive_quota_errors = (
            max_consecutive_quota_errors
            if max_consecutive_quota_errors is not None
            else settings.max_consecutive_quota_errors
        )
        self.default_max_output_tokens = settings.gemini_max_output_tokens
        self.temperature = settings.gemini_temperature
        self.max_retries = settings.gemini_max_retries
        logger.info(
            "Initialized Gemini provider (model=%s, delay=%.1fs, max_tokens=%d, temp=%.2f, max_retries=%d)",
            model,
            self.inter_request_delay_seconds,
            self.default_max_output_tokens,
            self.temperature,
            self.max_retries,
        )

    @classmethod
    def reset_circuit_breaker(cls) -> None:
        cls.gemini_quota_exhausted = False
        cls._consecutive_quota_errors = 0
        cls._circuit_breaker_active = False

    @classmethod
    def clear_cache_and_reset(cls) -> None:
        cls._cache.clear()
        cls.reset_circuit_breaker()

    @classmethod
    def is_circuit_breaker_active(cls) -> bool:
        return cls.gemini_quota_exhausted or cls._circuit_breaker_active

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        max_output_tokens: int | None = None,
    ) -> AIAnalysisOutput:
        if not self.api_key:
            logger.warning("Gemini request skipped because GEMINI_API_KEY is missing.")
            raise AIProviderError("Gemini is not configured. Set GEMINI_API_KEY to run AI analysis.")

        if GeminiProvider.gemini_quota_exhausted or self._circuit_breaker_active:
            logger.warning("Gemini quota protection is active. Skipping API request.")
            raise QuotaExhaustedError("Gemini API quota is exhausted. Stopping remaining requests.")

        cache_key = self._compute_cache_key(system_prompt, user_prompt)
        if cache_key in self._cache:
            logger.info("Reusing cached Gemini analysis result (0 API tokens consumed)")
            return self._cache[cache_key]

        tokens_limit = max_output_tokens or self.default_max_output_tokens
        try:
            output = await asyncio.to_thread(
                self._generate_sync, system_prompt, user_prompt, tokens_limit
            )
            self._cache[cache_key] = output
            GeminiProvider._consecutive_quota_errors = 0
            return output
        except QuotaExhaustedError:
            raise
        except AIProviderError:
            raise
        except Exception as exc:
            logger.warning("Gemini generation request failed: %s", exc, exc_info=True)
            raise AIProviderError(f"Gemini generation request failed: {exc}") from exc

    def _generate_sync(
        self, system_prompt: str, user_prompt: str, max_output_tokens: int
    ) -> AIAnalysisOutput:
        try:
            from google import genai
            from google.genai import errors, types
        except ImportError as exc:
            raise AIProviderError("google-genai is not installed.") from exc

        client = genai.Client(
            api_key=self.api_key,
            http_options=types.HttpOptions(timeout=self.timeout_seconds * 1000),
        )

        self._enforce_pacing_delay()

        attempt = 0
        max_transient_attempts = 2

        while attempt < max_transient_attempts:
            attempt += 1
            try:
                logger.info(
                    "[4] Gemini request started (model=%s, max_tokens=%d, attempt=%d/%d)",
                    self.model,
                    max_output_tokens,
                    attempt,
                    max_transient_attempts,
                )
                response = client.models.generate_content(
                    model=self.model,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        response_mime_type="application/json",
                        max_output_tokens=max_output_tokens,
                        temperature=self.temperature,
                    ),
                )
                GeminiProvider._last_request_finish_time = time.time()
                logger.info("[5] Gemini response received successfully (model=%s)", self.model)
                return self._parse_response(response)
            except (errors.APIError, errors.ClientError, errors.ServerError) as api_err:
                GeminiProvider._last_request_finish_time = time.time()
                status_code = getattr(api_err, "code", None) or getattr(api_err, "status_code", None)
                err_str = str(api_err).lower()
                is_quota_error = (
                    status_code == 429
                    or "429" in err_str
                    or "resource_exhausted" in err_str
                    or "quota" in err_str
                )
                is_transient_server_error = (
                    status_code in (503, 504)
                    or "503" in err_str
                    or "504" in err_str
                    or "deadline_exceeded" in err_str
                    or "unavailable" in err_str
                    or "overloaded" in err_str
                )

                if is_quota_error:
                    logger.error("Gemini returned 429 RESOURCE_EXHAUSTED. Activating quota circuit breaker.")
                    GeminiProvider.gemini_quota_exhausted = True
                    GeminiProvider._circuit_breaker_active = True
                    raise QuotaExhaustedError(f"Gemini API quota exhausted (429): {api_err}") from api_err

                if is_transient_server_error and attempt < max_transient_attempts:
                    retry_delay = self._extract_retry_delay(str(api_err))
                    logger.warning(
                        "Gemini transient server error (503/504), retrying attempt %d/%d after %.1fs",
                        attempt + 1,
                        max_transient_attempts,
                        retry_delay,
                    )
                    time.sleep(retry_delay)
                    continue

                logger.error("Gemini API call failed on attempt %d: %s", attempt, api_err, exc_info=True)
                raise AIProviderError(f"Gemini API error ({status_code or 'unknown'}): {api_err}") from api_err
            except AIProviderError:
                GeminiProvider._last_request_finish_time = time.time()
                raise
            except Exception as exc:
                GeminiProvider._last_request_finish_time = time.time()
                logger.error("Unexpected error during Gemini API call (attempt %d): %s", attempt, exc, exc_info=True)
                raise

        raise QuotaExhaustedError("Gemini request exceeded maximum retry attempts.")

    def _enforce_pacing_delay(self) -> None:
        if GeminiProvider._last_request_finish_time > 0:
            elapsed = time.time() - GeminiProvider._last_request_finish_time
            remaining = self.inter_request_delay_seconds - elapsed
            if remaining > 0:
                logger.info("Waiting %.1f seconds before next Gemini request", remaining)
                time.sleep(remaining)

    @staticmethod
    def _extract_retry_delay(error_text: str) -> float:
        match = re.search(r"retrydelay['\":\s]+(\d+(?:\.\d+)?)s?", error_text, re.IGNORECASE)
        if match:
            try:
                delay = float(match.group(1))
                return min(max(delay, 1.0), MAX_ALLOWED_RETRY_DELAY_SECONDS)
            except ValueError:
                pass
        match_sec = re.search(r"retry\s+after\s+(\d+)", error_text, re.IGNORECASE)
        if match_sec:
            try:
                delay = float(match_sec.group(1))
                return min(max(delay, 1.0), MAX_ALLOWED_RETRY_DELAY_SECONDS)
            except ValueError:
                pass
        return DEFAULT_RETRY_DELAY_SECONDS

    @staticmethod
    def _compute_cache_key(system_prompt: str, user_prompt: str) -> str:
        content = f"{system_prompt.strip()}|||{user_prompt.strip()}"
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    @staticmethod
    def _parse_response(response: Any) -> AIAnalysisOutput:
        text = getattr(response, "text", None)
        if not text or not str(text).strip():
            logger.error("[6] Gemini returned empty or blank text response.")
            raise AIProviderError("Gemini returned no structured response.")

        logger.info("[6] Raw text response length=%d chars", len(str(text)))
        logger.info("[7] JSON extraction/parsing started")

        clean_text = GeminiProvider._clean_json_text(str(text))
        try:
            raw_data = json.loads(clean_text)
            if isinstance(raw_data, dict):
                normalized = GeminiProvider._normalize_data_dict(raw_data)
                return AIAnalysisOutput.model_validate(normalized)
            return AIAnalysisOutput.model_validate_json(clean_text)
        except Exception:
            candidate = GeminiProvider._extract_json_object(clean_text)
            try:
                data = json.loads(candidate)
                if isinstance(data, dict):
                    normalized = GeminiProvider._normalize_data_dict(data)
                    return AIAnalysisOutput.model_validate(normalized)
                return AIAnalysisOutput.model_validate(data)
            except Exception as exc:
                logger.error("[7] JSON parsing failure on Gemini raw response: %s", clean_text[:300], exc_info=True)
                raise AIProviderError("Gemini response did not contain a valid JSON object.") from exc

    @staticmethod
    def _normalize_data_dict(data: dict[str, Any]) -> dict[str, Any]:
        normalized: dict[str, Any] = {}
        summary = data.get("summary") or data.get("executive_summary") or ""
        if isinstance(summary, list):
            summary = " ".join(str(item) for item in summary)
        normalized["summary"] = str(summary)

        findings = data.get("findings") or data.get("key_findings") or data.get("opportunities") or data.get("takeaways") or []
        if isinstance(findings, list):
            clean_findings = []
            for item in findings:
                if isinstance(item, dict):
                    title = item.get("title", "")
                    desc = item.get("description", "")
                    clean_findings.append(f"{title}: {desc}".strip(" :"))
                elif isinstance(item, str):
                    clean_findings.append(item)
            normalized["findings"] = clean_findings[:3]
        else:
            normalized["findings"] = []

        recs = data.get("recommendations") or []
        if not recs and ("top_priorities" in data or "next_steps" in data):
            recs = (data.get("top_priorities") or []) + (data.get("next_steps") or [])
        if isinstance(recs, list):
            clean_recs = []
            for item in recs:
                if isinstance(item, dict):
                    clean_recs.append(item.get("title") or item.get("description") or str(item))
                elif isinstance(item, str):
                    clean_recs.append(item)
            normalized["recommendations"] = clean_recs[:3]
        else:
            normalized["recommendations"] = []

        risks = data.get("risks") or []
        if isinstance(risks, list):
            clean_risks = []
            for item in risks:
                if isinstance(item, dict):
                    title = item.get("title", "")
                    desc = item.get("description", "")
                    clean_risks.append(f"{title}: {desc}".strip(" :"))
                elif isinstance(item, str):
                    clean_risks.append(item)
            normalized["risks"] = clean_risks[:3]
        else:
            normalized["risks"] = []

        assumptions = data.get("assumptions") or []
        if isinstance(assumptions, list):
            normalized["assumptions"] = [str(a) for a in assumptions[:2]]
        else:
            normalized["assumptions"] = []

        conf = data.get("confidence")
        if conf is not None:
            try:
                c_val = float(conf)
                normalized["confidence"] = c_val / 100.0 if c_val > 1.0 else min(max(c_val, 0.0), 1.0)
            except (ValueError, TypeError):
                normalized["confidence"] = 0.85
        else:
            normalized["confidence"] = 0.85

        normalized["metadata"] = data.get("metadata", {})
        return normalized

    @staticmethod
    def _clean_json_text(text: str) -> str:
        s = text.strip()
        if s.startswith("```"):
            lines = s.splitlines()
            if lines and lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            s = "\n".join(lines).strip()
        return s

    @staticmethod
    def _extract_json_object(text: str) -> str:
        start = text.find("{")
        end = text.rfind("}")
        if start < 0 or end <= start:
            raise AIProviderError("Gemini response did not contain a JSON object.")
        return text[start : end + 1]
