from fastapi import APIRouter
from app.services.blockchain_ledger.chain import VoveraBlockchain

router = APIRouter()
blockchain = VoveraBlockchain()

@router.get("/verify/{block_hash}")
def verify_block(block_hash: str):
    is_valid = blockchain.verify_block(block_hash)
    return {"block_hash": block_hash, "verified": is_valid}

@router.get("/stats")
def get_stats():
    return {"total_blocks": len(blockchain.chain), "status": "healthy"}
