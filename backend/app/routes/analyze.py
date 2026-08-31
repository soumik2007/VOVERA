from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.services.ai.deepfake_detector import DeepfakeDetector
from app.services.ai.copilot_generator import CopilotGenerator
from app.services.blockchain_ledger.chain import VoveraBlockchain
import hashlib
from typing import Optional

router = APIRouter()
detector = DeepfakeDetector()
copilot = CopilotGenerator()
blockchain = VoveraBlockchain()

@router.post("/post-call")
async def analyze_call(
    audio: UploadFile = File(...),
    caller_id: str = Form(...),
    db: Session = Depends(get_db)
):
    # Hash caller ID for privacy
    caller_hash = hashlib.sha256(caller_id.encode()).hexdigest()
    
    # In a real app, we would save the audio temporarily
    # audio_path = save_temp(audio)
    audio_path = "temp_stub.wav"
    
    analysis_result = detector.analyze(audio_path)
    report_text = copilot.generate_alert(analysis_result["signals"])
    
    # Audit trail
    block = blockchain.add_audit_event(
        action="call_analysis",
        caller_hash=caller_hash,
        risk_score=analysis_result["risk_score"],
        signals=analysis_result["signals"]
    )
    
    return {
        "caller_hash": caller_hash,
        "risk_score": analysis_result["risk_score"],
        "signals": analysis_result["signals"],
        "report": report_text,
        "block_verification": block.get("curr_hash", "")
    }
