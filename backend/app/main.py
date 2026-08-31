from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health, analyze, spam, blockchain, translate
from app.models.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VOVERA v2.0 API",
    description="AI-powered voice cloning detection and fraud prevention",
    version="2.0.0"
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
