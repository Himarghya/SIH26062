from fastapi import APIRouter
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.dashboard import router as dashboard_router
from backend.app.api.v1.expeditions import router as expeditions_router
from backend.app.api.v1.cargo import router as cargo_router
from backend.app.api.v1.inventory import router as inventory_router
from backend.app.api.v1.personnel import router as personnel_router
from backend.app.api.v1.assets import router as assets_router
from backend.app.api.v1.stations import router as stations_router
from backend.app.api.v1.emergency import router as emergency_router
from backend.app.api.v1.analytics import router as analytics_router
from backend.app.api.v1.notifications import router as notifications_router
from backend.app.api.v1.simulation import router as simulation_router
from backend.app.api.v1.ml import router as ml_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(expeditions_router, prefix="/expeditions", tags=["Expeditions"])
api_router.include_router(cargo_router, prefix="/cargo", tags=["Cargo Tracking"])
api_router.include_router(inventory_router, prefix="/inventory", tags=["Inventory Management"])
api_router.include_router(personnel_router, prefix="/personnel", tags=["Personnel & Muster"])
api_router.include_router(assets_router, prefix="/assets", tags=["Asset Management"])
api_router.include_router(stations_router, prefix="/stations", tags=["Research Stations & Weather"])
api_router.include_router(emergency_router, prefix="/emergency", tags=["Emergency & SAR"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(simulation_router, prefix="/simulation", tags=["Digital Twin Simulation"])
api_router.include_router(ml_router, prefix="/predict", tags=["ML Engine"])

