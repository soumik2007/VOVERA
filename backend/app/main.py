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
        while True:
            # Receive raw binary PCM data from browser (Float32Array)
            data = await websocket.receive_bytes()
            
            if shield is None:
                await websocket.send_json({"error": "AI models still loading..."})
                continue
                
            # Convert bytes to torch tensor
            audio_np = np.frombuffer(data, dtype=np.float32)
            audio_tensor = torch.from_numpy(audio_np).unsqueeze(0) # [1, time]
            
            # Run through ECAPA-TDNN and HuBERT
            results = shield.analyze_audio_chunk(audio_tensor, sample_rate=16000)
            
            # Simple risk calculation based on acoustic variance and phonetic marker for prototype
            # -- THE DEEPFAKE DETECTOR LOGIC (Model Fusion) --
            
            # 1. Baseline Human Score (from ECAPA-TDNN)
            acoustic_score = abs(results.get('acoustic_variance', 0) / 50)
            
            # 2. Robotic Phonetic Penalty (from HuBERT)
            # AI voices have unnaturally uniform phonetic spaces. 
            # If phonetic variance drops below normal, penalize heavily.
            phonetic_var = results.get('phonetic_variance', 0.5)
            robotic_penalty = 0
            if phonetic_var < 0.2:  # Too perfectly pronounced / flat
                robotic_penalty += 30
                
            # 3. Phone Speaker / Digital Artifact Penalty (from Audio Physics)
            # A phone playing into a laptop mic creates hiss/distortion (high ZCR)
            # and unnatural energy curves.
            zcr = results.get('zcr', 0)
            energy_std = results.get('energy_std', 0)
            
            artifact_penalty = 0
            if zcr > 0.08: # Natural voice is usually lower. Static/Speaker is high.
                artifact_penalty += (zcr * 400)
            if energy_std < 0.005 and zcr > 0.05: # Flat energy + noise = speaker playback
                artifact_penalty += 40
                
            # Final Fusion Score
            risk_score = int(acoustic_score + robotic_penalty + artifact_penalty)
            
            # Ensure normal speech hovers at 10-15
            if risk_score < 10:
                risk_score = 10 + int(acoustic_score)
                
            risk_score = min(100, risk_score)
            
            # Ensure it doesn't stay perfectly at 0 to show activity
            if risk_score < 3:
                risk_score = 3
            
            # Send real-time risk assessment back to UI
            await websocket.send_json({
                "status": "success",
                "risk_score": risk_score,
                "details": results
            })
    except WebSocketDisconnect:
        print("UI disconnected from Audio Stream.")
    except Exception as e:
        print(f"Error in websocket stream: {e}")
