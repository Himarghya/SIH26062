import os
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.session import engine, Base, SessionLocal
from backend.app.db.models import Station
from backend.app.db.seed import seed_database
from backend.app.api.v1 import api_router
from backend.app.api.v1.ml import router as ml_router

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    description="Centralized operational platform for Indian Antarctic & Arctic expedition logistics, cargo, assets, inventory, and emergency SAR."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    try:
        db = SessionLocal()
        station_count = db.query(Station).count()
        db.close()
        if station_count == 0:
            print("[Startup] Empty database detected. Seeding initial POLARIS operational datasets...")
            seed_database()
            print("[Startup] Database seeded successfully.")
    except Exception as e:
        print(f"[Startup Warning] Seeding check: {e}")

app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(ml_router, prefix="/predict", tags=["ML Engine (Direct)"])


@app.get("/health", tags=["Health & Diagnostics"])
def health_check():
    return {
        "status": "ONLINE",
        "service": "POLARIS Polar Mission Logistics Engine",
        "organization": "NCPOR • Ministry of Earth Sciences",
        "version": settings.VERSION,
        "mode": "Simulation Demonstration Platform"
    }

@app.get("/ready", tags=["Health & Diagnostics"])
def readiness_check():
    return {
        "status": "READY",
        "database_connected": True,
        "satellite_sync_engine": "ONLINE",
        "telemetry_adapter": "ACTIVE"
    }

@app.get("/metrics", tags=["Health & Diagnostics"])
def metrics_endpoint():
    return {
        "active_threads": 8,
        "api_uptime_seconds": 3600,
        "satellite_sync_queue_depth": 0,
        "cold_chain_sample_count": 12,
        "active_incidents": 1
    }

# SPA & Static Assets Serving for Unified Render Deployment
DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "client", "dist")

if os.path.exists(DIST_DIR):
    assets_path = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="static-assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa_frontend(request: Request, full_path: str):
        # Ignore API, docs, and telemetry endpoints
        if full_path.startswith("api") or full_path.startswith("predict") or full_path in [
            "health", "ready", "metrics", "docs", "redoc", "openapi.json"
        ]:
            return None
        file_path = os.path.join(DIST_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_path = os.path.join(DIST_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"message": "POLARIS Frontend is building or not found at client/dist"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
