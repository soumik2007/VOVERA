# 🛡️ VOVERA v2.0

AI-powered voice cloning detection and fraud prevention mobile application and backend system.

## 🎯 Architecture Overview

```text
+-------------------+       +-----------------------+       +-------------------+
|                   |       |                       |       |                   |
|   React Native    | ----> |      FastAPI          | ----> |  AI Microservices |
|   Mobile App      |       |      Backend          |       |  (HuBERT, ECAPA)  |
|                   |       |                       |       |                   |
+-------------------+       +-----------------------+       +-------------------+
        |                           |                               |
        v                           v                               v
+-------------------+       +-----------------------+       +-------------------+
|                   |       |                       |       |                   |
|   Local SQLite    |       |  PostgreSQL / Redis   |       | Blockchain Ledger |
|   (Blockchain)    |       |                       |       |   (Tamper-proof)  |
+-------------------+       +-----------------------+       +-------------------+
```

## 🚀 Setup & Run

### Prerequisites
- Node.js & npm (for Expo)
- Python 3.11+
- Docker & Docker Compose

### Backend Setup
1. `cd backend`
2. `python -m venv venv`
3. `source venv/bin/activate`
4. `pip install -r requirements.txt`
5. `uvicorn app.main:app --reload`

Alternatively, use Docker:
`docker-compose up --build`

### Mobile Setup
1. `cd mobile`
2. `npm install`
3. `cp .env.example .env` (update API URL if needed)
4. `npx expo start`

## 📚 API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🛡️ License
MIT License
