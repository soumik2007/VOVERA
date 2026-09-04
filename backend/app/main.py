from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health, analyze, spam, blockchain, translate
from app.models.database import engine, Base
import torch
import numpy as np
from app.services.ai.vovera_shield import VoveraShield

# Create database tables
Base.metadata.create_all(bind=engine)

shield = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global shield
    print("Initializing VoveraShield AI Models... This may take a minute.")
    try:
        shield = VoveraShield()
        print("VoveraShield Ready!")
    except Exception as e:
        print(f"Failed to load AI models: {e}")
    yield
    print("Shutting down...")

app = FastAPI(
    title="VOVERA v2.0 API",
    description="AI-powered voice cloning detection and fraud prevention",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/v1/health", tags=["Health"])
app.include_router(analyze.router, prefix="/api/v1/analyze", tags=["Analyze"])
app.include_router(spam.router, prefix="/api/v1/spam", tags=["Spam"])
app.include_router(blockchain.router, prefix="/api/v1/blockchain", tags=["Blockchain"])
app.include_router(translate.router, prefix="/api/v1/translate", tags=["Translate"])

@app.get("/")
def root():
    return {"message": "Welcome to VOVERA v2.0 API"}

@app.websocket("/api/v1/stream-audio")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("UI Connected to Live Audio Stream.")
    try:
        scam_intent_active = False
        last_transcript = ""

        while True:
            message = await websocket.receive()
            
            # --- SEMANTIC LAYER (FLAN-T5) ---
            if "text" in message:
                try:
                    import json
                    payload = json.loads(message["text"])
                    if payload.get("type") == "transcript":
                        transcript_text = payload.get("text", "")
                        if len(transcript_text.strip()) > 5:
                            last_transcript = transcript_text
                            semantic_res = shield.analyze_transcript(transcript_text)
                            scam_intent_active = semantic_res.get("scam_intent_detected", False)
                            print(f"[Semantic] '{transcript_text}' -> Scam: {scam_intent_active}")
                except Exception as e:
                    print(f"Error parsing text payload: {e}")
                continue
                
            # --- ACOUSTIC LAYER (ECAPA-TDNN & HuBERT) ---
            if "bytes" in message:
                data = message["bytes"]
                if shield is None:
                    await websocket.send_json({"error": "AI models still loading..."})
                    continue
                    
                audio_np = np.frombuffer(data, dtype=np.float32).copy()
                audio_tensor = torch.from_numpy(audio_np).unsqueeze(0)
                
                results = shield.analyze_audio_chunk(audio_tensor, sample_rate=16000)
                
                # 1. Baseline Human Score (from ECAPA-TDNN)
                acoustic_score = abs(results.get('acoustic_variance', 0) / 50)
                
                # 2. Robotic Phonetic Penalty (from HuBERT)
                phonetic_var = results.get('phonetic_variance', 0.5)
                robotic_penalty = 0
                if phonetic_var < 0.2: 
                    robotic_penalty += 30
                    
                # 3. Digital Artifact Penalty
                zcr = results.get('zcr', 0)
                energy_std = results.get('energy_std', 0)
                artifact_penalty = 0
                if zcr > 0.08:
                    artifact_penalty += (zcr * 400)
                if energy_std < 0.005 and zcr > 0.05:
                    artifact_penalty += 40
                    
                # The "Robot Probability"
                robot_risk = int(acoustic_score + robotic_penalty + artifact_penalty)
                
                # --- MULTI-MODAL FUSION DECISION ---
                if robot_risk >= 80:
                    if scam_intent_active:
                        # It is a robot AND the transcript is a scam -> TERMINATE
                        risk_score = 100
                    else:
                        # It is a robot, BUT the conversation is safe (e.g. Pharmacy) -> WARNING
                        risk_score = 75
                else:
                    risk_score = robot_risk
                    
                if risk_score < 10:
                    risk_score = 10 + int(acoustic_score)
                    
                risk_score = min(100, risk_score)
                
                try:
                    await websocket.send_json({
                        "status": "success",
                        "risk_score": risk_score,
                        "scam_intent": scam_intent_active,
                        "transcript": last_transcript,
                        "details": results
                    })
                except RuntimeError:
                    # Occurs if the client closed the connection while we were processing
                    break
    except WebSocketDisconnect:
        print("UI disconnected from Audio Stream.")
    except Exception as e:
        print(f"Error in websocket stream: {e}")
