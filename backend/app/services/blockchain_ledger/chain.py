import hashlib
import json
import time

class VoveraBlockchain:
    def __init__(self):
        self.chain = []
        self.create_genesis_block()

    def create_genesis_block(self):
        genesis = {
            "block_index": 0,
            "timestamp": time.time(),
            "action": "genesis",
            "caller_hash": "0",
            "risk_score": 0,
            "signals": [],
            "prev_hash": "0",
            "curr_hash": self.hash_block({"block_index": 0, "prev_hash": "0"})
        }
        self.chain.append(genesis)

    def hash_block(self, block: dict) -> str:
        block_string = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()

    def add_audit_event(self, action: str, caller_hash: str, risk_score: int, signals: list) -> dict:
        prev_block = self.chain[-1]
        new_block = {
            "block_index": len(self.chain),
            "timestamp": time.time(),
            "action": action,
            "caller_hash": caller_hash,
            "risk_score": risk_score,
            "signals": signals,
            "prev_hash": prev_block["curr_hash"]
        }
        new_block["curr_hash"] = self.hash_block(new_block)
        self.chain.append(new_block)
        # TODO: Save to SQLite storage via storage.py
        return new_block

    def verify_block(self, block_hash: str) -> bool:
        for block in self.chain:
            if block["curr_hash"] == block_hash:
                return True
        return False

    def verify_chain(self) -> bool:
        for i in range(1, len(self.chain)):
            curr = self.chain[i]
            prev = self.chain[i-1]
            if curr["prev_hash"] != prev["curr_hash"]:
                return False
            # Re-hash current block except curr_hash to verify
            temp_block = {k: v for k, v in curr.items() if k != "curr_hash"}
            if self.hash_block(temp_block) != curr["curr_hash"]:
                return False
        return True
