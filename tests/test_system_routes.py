from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_returns_operational_status() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "name": "STRATOS",
        "status": "running",
        "message": "STRATOS backend is operational",
    }


def test_health_check_returns_healthy_status() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_cors_preflight_allows_local_frontend() -> None:
    response = client.options(
        "/api/v1/analysis/run",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
