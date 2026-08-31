from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader
from app.config import settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def verify_api_key(api_key_header: str = Security(api_key_header)):
    # Stub for API key validation
    # if api_key_header != "expected_key":
    #     raise HTTPException(status_code=403, detail="Could not validate API key")
    pass
