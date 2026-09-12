"""
POLARIS ML Engine - API
========================
FastAPI service exposing the 4 ML components as REST endpoints.

Run:
    python api.py
    # or: uvicorn api:app --reload --port 8000

Docs:
    http://localhost:8000/docs
"""
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from models import blizzard_risk, fuel_forecast, coldchain_anomaly, sar_risk
from data_gen import (
    generate_weather_data, generate_fuel_data,
    generate_coldchain_data, generate_sar_data,
)

app = FastAPI(title="POLARIS ML Engine", version="1.0.0")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"],
    allow_methods=["*"], allow_headers=["*"],
)

_models = {}


def _ensure_trained():
    """Train (or load cached) models on first request."""
    if _models:
        return
    try:
        _models["blizzard"] = blizzard_risk.load_model()
    except FileNotFoundError:
        _models["blizzard"], _ = blizzard_risk.train(generate_weather_data())

    try:
        _models["fuel"] = fuel_forecast.load_model()
    except FileNotFoundError:
        _models["fuel"], _, _ = fuel_forecast.train(generate_fuel_data())

    try:
        _models["coldchain"] = coldchain_anomaly.load_model()
    except FileNotFoundError:
        _models["coldchain"] = coldchain_anomaly.train(generate_coldchain_data())

    try:
        _models["sar"] = sar_risk.load_model()
    except FileNotFoundError:
        _models["sar"], _ = sar_risk.train(generate_sar_data())


@app.on_event("startup")
def startup():
    _ensure_trained()


# Also train eagerly at import time so the models are ready even when
# this module is used outside a full ASGI lifecycle (e.g. TestClient
# without a `with` block, or direct function calls / notebooks).
_ensure_trained()


# ---------------------------------------------------------------------
# 1. WEATHER / BLIZZARD RISK
# ---------------------------------------------------------------------
class WeatherRequest(BaseModel):
    station: str
    temperature_c: float
    wind_speed_kmh: float
    wind_gust_kmh: float
    pressure_hpa: float
    pressure_change_3h: float
    visibility_m: float
    humidity_pct: float
    wind_chill_c: float


@app.post("/predict/weather-risk")
def predict_weather_risk(req: WeatherRequest):
    return blizzard_risk.predict(_models["blizzard"], **req.model_dump())


# ---------------------------------------------------------------------
# 2. FUEL / INVENTORY FORECAST
# ---------------------------------------------------------------------
class FuelRequest(BaseModel):
    station: str
    current_stock_l: float
    temperature_c: float
    wind_speed_kmh: float
    personnel_count: int
    generator_load_pct: float
    blizzard_flag: int
    equipment_usage_hrs: float
    resupply_in_days: Optional[int] = None


@app.post("/predict/fuel-forecast")
def predict_fuel_forecast(req: FuelRequest):
    conditions = {
        "temperature_c": req.temperature_c,
        "wind_speed_kmh": req.wind_speed_kmh,
        "personnel_count": req.personnel_count,
        "generator_load_pct": req.generator_load_pct,
        "blizzard_flag": req.blizzard_flag,
        "equipment_usage_hrs": req.equipment_usage_hrs,
    }
    return fuel_forecast.forecast(
        _models["fuel"], req.station, req.current_stock_l,
        conditions, resupply_in_days=req.resupply_in_days,
    )


# ---------------------------------------------------------------------
# 3. COLD-CHAIN ANOMALY DETECTION
# ---------------------------------------------------------------------
class ColdChainRequest(BaseModel):
    cargo_id: str
    temperatures: list[float]   # recent stream, oldest first
    target_temp_c: float
    breach_margin_c: float = 5.0


@app.post("/predict/coldchain-anomaly")
def predict_coldchain_anomaly(req: ColdChainRequest):
    if len(req.temperatures) < 2:
        raise HTTPException(400, "Need at least 2 temperature readings")
    return coldchain_anomaly.score_stream(
        _models["coldchain"], req.cargo_id, req.temperatures,
        req.target_temp_c, req.breach_margin_c,
    )


# ---------------------------------------------------------------------
# 4. SAR RISK + ASSET RANKING
# ---------------------------------------------------------------------
class SarRiskRequest(BaseModel):
    incident_id: str
    distance_km: float
    visibility_m: float
    wind_kmh: float
    temperature_c: float
    personnel_available: int
    asset_fuel_pct: float
    time_since_contact_hr: float
    asset_type: str = "snowcat"


@app.post("/predict/sar-risk")
def predict_sar_risk(req: SarRiskRequest):
    data = req.model_dump()
    incident_id = data.pop("incident_id")
    return sar_risk.predict_incident_risk(_models["sar"], incident_id, **data)


class AssetInput(BaseModel):
    name: str
    distance_km: float
    fuel_pct: float
    weather_compat_pct: float
    availability: str = "READY"
    payload_ok: bool = True


class AssetRankRequest(BaseModel):
    assets: list[AssetInput]


@app.post("/predict/sar-asset-ranking")
def predict_asset_ranking(req: AssetRankRequest):
    return sar_risk.rank_assets([a.model_dump() for a in req.assets])


@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": list(_models.keys())}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=False)
