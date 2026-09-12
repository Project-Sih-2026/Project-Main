import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import SessionLocal, Base, engine
from app.models import (
    User, Camera, CameraTelemetry, Detection,
    OCRCorrection, Watchlist, Alert, AlertAction,
    AuditLog, RetentionPolicy
)
from app.api.v1 import (
    auth, cameras, detections, routes, search,
    alerts, analytics, health, audit, export, hospitals
)
from app.services.telemetry_service import manager
from app.services.ai_pipeline import ensure_evidence_dirs

# Ensure tables and evidence directories exist
Base.metadata.create_all(bind=engine)
ensure_evidence_dirs()

# Background task for live simulated feed events
async def background_feed_emitter():
    while True:
        await asyncio.sleep(8)
        try:
            # Broadcast live telemetry update
            await manager.broadcast({
                "type": "TELEMETRY_HEARTBEAT",
                "timestamp": "now",
                "status": "OPTIMAL"
            })
        except Exception:
            pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: auto-seed if database is freshly initialized or empty
    try:
        from seed_data import seed_database
        from app.models.camera import Camera
        db = SessionLocal()
        try:
            if db.query(Camera).count() == 0:
                print("⚡ Database is empty. Auto-seeding cameras, routes, and baseline detections...")
                seed_database(target_db=db)
                print("✅ Database auto-seeding complete.")
        finally:
            db.close()
    except Exception as e:
        print(f"[Startup Notice] Auto-seed check: {e}")

    # Startup: spawn background emitter
    task = asyncio.create_task(background_feed_emitter())
    yield
    # Shutdown
    task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for City-Wide AI Vehicle Tracking & Traffic Analytics Platform",
    lifespan=lifespan
)

# CORS Configuration - permits all dev origins across LAN and multi-device networks
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files (Evidence & Feeds)
os.makedirs("static", exist_ok=True)
os.makedirs("static/evidence", exist_ok=True)
os.makedirs("static/feeds", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Register API v1 Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(cameras.router, prefix=settings.API_V1_STR)
app.include_router(detections.router, prefix=settings.API_V1_STR)
app.include_router(routes.router, prefix=settings.API_V1_STR)
app.include_router(search.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(export.router, prefix=settings.API_V1_STR)
app.include_router(hospitals.router, prefix=settings.API_V1_STR)

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or handle commands
            await websocket.send_text(f'{{"type": "ACK", "echo": "{data}"}}')
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "docs_url": "/docs"
    }
