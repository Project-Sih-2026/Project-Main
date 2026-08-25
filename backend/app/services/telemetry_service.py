import asyncio
import json
import random
from datetime import datetime, timezone
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(json.dumps(message, default=str))
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

def get_simulated_telemetry(camera_id: str, designation: str, lat: float, lng: float) -> dict:
    """
    Generates realistic dynamic telemetry for a camera node.
    """
    throughput = round(random.uniform(3.8, 5.2), 2)
    ping = random.randint(14, 28)
    
    return {
        "camera_id": camera_id,
        "designation": designation,
        "latitude": lat,
        "longitude": lng,
        "status": "nominal",
        "throughput_mbps": throughput,
        "uptime_str": "14d 6h 22m",
        "ping_ms": ping,
        "last_heartbeat": datetime.now(timezone.utc).isoformat()
    }
