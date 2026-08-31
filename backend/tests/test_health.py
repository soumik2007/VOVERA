from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_readiness_probe():
    response = client.get("/api/v1/health/readiness")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}
