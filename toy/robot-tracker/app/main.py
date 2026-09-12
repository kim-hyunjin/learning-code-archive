import asyncio
import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.simulator import RobotFleetSimulator

STATIC_DIR = Path(__file__).parent / "static"
TICK_SECONDS = 0.2

simulator = RobotFleetSimulator.create(count=3)


class ConnectionManager:
    def __init__(self) -> None:
        self.active: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active.add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self.active.discard(websocket)

    async def broadcast(self, message: dict) -> None:
        payload = json.dumps(message)
        dead: list[WebSocket] = []
        for websocket in self.active:
            try:
                await websocket.send_text(payload)
            except Exception:
                dead.append(websocket)
        for websocket in dead:
            self.disconnect(websocket)


manager = ConnectionManager()


async def broadcast_loop() -> None:
    while True:
        simulator.step(TICK_SECONDS)
        await manager.broadcast(simulator.snapshot())
        await asyncio.sleep(TICK_SECONDS)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(broadcast_loop())
    yield
    task.cancel()


app = FastAPI(title="Robot Position Tracker", lifespan=lifespan)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
async def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.websocket("/ws/robots")
async def robots_ws(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        # Send the current state immediately so late joiners aren't stuck
        # waiting for the next tick.
        await websocket.send_text(json.dumps(simulator.snapshot()))
        while True:
            # This endpoint is broadcast-only; keep the connection alive and
            # drop the client if it disconnects.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
