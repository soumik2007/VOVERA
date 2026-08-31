from fastapi import APIRouter

router = APIRouter()

@router.get("")
def health_check():
    return {"status": "ok"}

@router.get("/readiness")
def readiness_probe():
    return {"status": "ready"}

@router.get("/liveness")
def liveness_probe():
    return {"status": "alive"}
