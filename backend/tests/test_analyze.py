from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_analyze_call_missing_file():
    response = client.post("/api/v1/analyze/post-call", data={"caller_id": "1234567890"})
    assert response.status_code == 422 # Unprocessable Entity due to missing file
