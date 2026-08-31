from sqlalchemy import create_engine, Column, Integer, String, Float, JSON, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class CallAnalysis(Base):
    __tablename__ = "call_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    caller_hash = Column(String, index=True)
    risk_score = Column(Float)
    signals = Column(JSON)
    report_text = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    audio_hash = Column(String) # No raw audio

class SpamFlag(Base):
    __tablename__ = "spam_flags"
    
    id = Column(Integer, primary_key=True, index=True)
    caller_hash = Column(String, index=True)
    reason = Column(String)
    device_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
