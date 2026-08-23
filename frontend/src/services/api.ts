// ============================================================
// Base API client — reads VITE_API_BASE_URL from environment.
// All HTTP communication goes through this module; never
// put API keys in the frontend.
// ============================================================

// If VITE_API_BASE_URL is not set, use empty string '' to leverage
// the Vite dev server proxy configured in vite.config.ts.
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const API_BASE_URL = rawBaseUrl ? rawBaseUrl.replace(/\/+$/, '') : '';

export class ApiError extends Error {
  public readonly status: number;
  public readonly detail: string;

  constructor(status: number, detail: string) {
    super(`API error ${status}: ${detail}`);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  console.log(`[API Response] ${response.status} ${response.statusText} from ${response.url}`);
  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      console.error('[API Error Response Body]:', body);
      detail = body?.detail ?? (typeof body?.message === 'string' ? body.message : detail);
    } catch (parseErr) {
      console.warn('[API] Failed to parse error response JSON:', parseErr);
    }
    throw new ApiError(response.status, detail);
  }

  try {
    const data = await response.json();
    console.log('[API Parsed Response Data]:', data);
    return data as T;
  } catch (parseErr) {
    console.error('[API] Failed to parse success response JSON:', parseErr);
    throw parseErr;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  console.log(`[API GET] Requesting: ${url}`);
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  console.log(`[API POST] Requesting: ${url}`, body);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  console.log(`[API POST Form] Requesting: ${url}`);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    // Do NOT set Content-Type — browser sets multipart/form-data with boundary automatically
    body: formData,
  });
  return handleResponse<T>(response);
}

export { API_BASE_URL };
