from fastapi import APIRouter, UploadFile, File, Form, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.services.ai.deepfake_detector import DeepfakeDetector
from app.services.ai.copilot_generator import CopilotGenerator
from app.services.blockchain_ledger.chain import VoveraBlockchain
import hashlib
import json

router = APIRouter()
detector = DeepfakeDetector()
copilot = CopilotGenerator()
blockchain = VoveraBlockchain()

# Existing POST route for completed calls
@router.post("/post-call")
async def analyze_call(
    audio: UploadFile = File(...),
    caller_id: str = Form(...),
    db: Session = Depends(get_db)
):
    caller_hash = hashlib.sha256(caller_id.encode()).hexdigest()
    audio_path = "temp_stub.wav"
    
    analysis_result = detector.analyze(audio_path)
    report_text = copilot.generate_alert(analysis_result["signals"])
    
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

# NEW: Real-time WebSocket streaming route for active calls
@router.websocket("/ws/stream")
async def websocket_stream_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("New live call audio stream connected.")
    try:
        while True:
            # Receive audio chunk (bytes) from the active call
            data = await websocket.receive_bytes()
            
            # 1. Process the live chunk with AI models (HuBERT/ECAPA)
            analysis_result = detector.analyze_live_chunk(data)
            
            # 2. If high risk detected mid-call, send abort signal
            if analysis_result["risk_score"] > 80:
                report_text = copilot.generate_alert(analysis_result["signals"])
                
                # Save to database
                db = next(get_db())
                from app.models.database import CallAnalysis
                new_call = CallAnalysis(
                    caller_hash="anonymous_caller_" + str(hash(data)),
                    risk_score=analysis_result["risk_score"],
                    signals=analysis_result["signals"],
                    report_text=report_text
                )
                db.add(new_call)
                db.commit()
                db.refresh(new_call)
                
                # Send immediate CUT_CALL signal back to mobile app with the new DB ID
                await websocket.send_json({
                    "action": "CUT_CALL",
                    "risk_score": analysis_result["risk_score"],
                    "signals": analysis_result["signals"],
                    "report": report_text,
                    "id": new_call.id
                })
                break
            else:
                # Send SAFE heartbeat
                await websocket.send_json({
                    "action": "SAFE",
                    "risk_score": analysis_result["risk_score"]
                })
                
    except WebSocketDisconnect:
        print("Live call audio stream disconnected.")

# NEW: Fetch recent calls for Dashboard
@router.get("/history")
def get_call_history(limit: int = 10, db: Session = Depends(get_db)):
    from app.models.database import CallAnalysis
    calls = db.query(CallAnalysis).order_by(CallAnalysis.created_at.desc()).limit(limit).all()
    return [{
        "id": c.id,
        "caller_hash": c.caller_hash, # Using hash in place of real number for privacy
        "risk_score": c.risk_score,
        "created_at": c.created_at,
        "is_safe": c.risk_score < 50
    } for c in calls]

# NEW: Fetch specific forensics report
@router.get("/report/{call_id}")
def get_forensics_report(call_id: int, db: Session = Depends(get_db)):
    from app.models.database import CallAnalysis
    from fastapi import HTTPException
    call = db.query(CallAnalysis).filter(CallAnalysis.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Report not found")
    return {
        "id": call.id,
        "caller_hash": call.caller_hash,
        "risk_score": call.risk_score,
        "signals": call.signals,
        "report_text": call.report_text,
        "created_at": call.created_at
    }
