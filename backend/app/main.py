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
        current_robot_risk = 0 # Cascade level 1 state

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
                            
                            # LEVEL 1 GATE: Only run NLP if Acoustic Layer flags it as a robot!
                            if current_robot_risk > 55:
                                semantic_res = shield.analyze_transcript(transcript_text)
                                scam_intent_active = semantic_res.get("scam_intent_detected", False)
                                print(f"[Semantic Level 2] '{transcript_text}' -> Scam: {scam_intent_active}")
                            else:
                                scam_intent_active = False
                                print(f"[Semantic Skipped] Acoustic risk {current_robot_risk}% is too low to trigger NLP.")
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
                raw_var = abs(results.get('acoustic_variance', 0))
                base_score = (raw_var % 10) + 5 # 5 to 14
                
                # 2. Extract Acoustic/Phonetic Features
                phonetic_var = results.get('phonetic_variance', 0.5)
                zcr = results.get('zcr', 0.0)
                energy_std = results.get('energy_std', 0.01)
                
                # 3. Continuous Anomaly Scaling (No more harsh +50 jumps!)
                # Humans have high phonetic variance (expressive) and dynamic energy (breathing).
                # AI TTS is mathematically uniform (low variance) and highly compressed (low energy std).
                
                phonetic_anomaly = max(0, 0.15 - phonetic_var) * 200  # Scales 0 to 30
                energy_anomaly = max(0, 0.01 - energy_std) * 3000     # Scales 0 to 30
                
                # Laptop mics naturally have high ZCR (static). 
                # We only heavily penalize extreme ZCR (> 0.25) which indicates a physical phone speaker playback.
                speaker_anomaly = max(0, zcr - 0.25) * 100            # Scales 0 to ~20
                
                robot_risk = int(base_score + phonetic_anomaly + energy_anomaly + speaker_anomaly)
                current_robot_risk = robot_risk # Update the cascade gate state
                
                # --- MULTI-MODAL FUSION DECISION ---
                # Acoustic layers can only warn up to 80% to prevent false positives on bad microphones.
                # ONLY the Semantic layer (FLAN-T5) can push it to 100% and terminate the call.
                
                robot_risk = min(80, robot_risk)
                
                if scam_intent_active:
                    risk_score = max(96, robot_risk + 40) # Instant Termination!
                else:
                    risk_score = robot_risk # Safe or Warning zone
                    
                if risk_score < 10:
                    risk_score = 10 + int(base_score)
                    
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
