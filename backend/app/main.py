from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.session import engine, Base
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
