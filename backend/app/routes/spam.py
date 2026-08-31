from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models.database import get_db

router = APIRouter()

class SpamFlagRequest(BaseModel):
    caller_hash: str
    reason: str
    device_id: str

@router.post("/flag")
def flag_spam(request: SpamFlagRequest, db: Session = Depends(get_db)):
    # Here we would save the spam flag to DB
    # spam = SpamFlag(**request.dict())
    # db.add(spam)
    # db.commit()
    return {"status": "success", "message": "Spam reported successfully"}

@router.get("/check/{caller_hash}")
def check_spam(caller_hash: str, db: Session = Depends(get_db)):
    # Mock response
    return {
        "caller_hash": caller_hash,
        "reputation_score": 85,
        "flag_count": 3
    }
