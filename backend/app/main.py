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
            # In a real app, you would pass these embeddings into an AASIST scoring layer
            acoustic_score = abs(results.get('acoustic_variance', 0) * 100)
            phonetic_score = abs(results.get('phonetic_marker', 0) * 50)
            
            # Base logic: any high distortion/unnatural embedding bumps risk
            risk_score = min(100, int(acoustic_score + phonetic_score))
            
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
