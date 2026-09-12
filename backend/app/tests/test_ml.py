import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_ml_health():
    resp = client.get("/api/v1/predict/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "blizzard" in data["models_loaded"]
    assert "fuel" in data["models_loaded"]
    assert "coldchain" in data["models_loaded"]
    assert "sar" in data["models_loaded"]

def test_weather_blizzard_risk_prediction():
    payload = {
        "station": "Bharati",
        "temperature_c": -38.0,
        "wind_speed_kmh": 95.0,
        "wind_gust_kmh": 130.0,
        "pressure_hpa": 955.0,
        "pressure_change_3h": -6.0,
        "visibility_m": 250.0,
        "humidity_pct": 88.0,
        "wind_chill_c": -55.0
    }
    # Test /api/v1/predict/weather-risk
    resp = client.post("/api/v1/predict/weather-risk", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["station"] == "Bharati"
    assert "blizzard_probability_pct" in data
    assert "predicted_risk" in data
    assert "visibility_risk" in data
    assert "wind_risk" in data
    assert data["visibility_risk"] == "HIGH"
    assert data["wind_risk"] == "HIGH"

    # Test /predict/weather-risk direct root endpoint
    resp_direct = client.post("/predict/weather-risk", json=payload)
    assert resp_direct.status_code == 200
    assert resp_direct.json()["station"] == "Bharati"

def test_fuel_consumption_forecast():
    payload = {
        "station": "Bharati",
        "current_stock_l": 72400.0,
        "temperature_c": -32.0,
        "wind_speed_kmh": 60.0,
        "personnel_count": 55,
        "generator_load_pct": 70.0,
        "blizzard_flag": 0,
        "equipment_usage_hrs": 12.0,
        "resupply_in_days": 26
    }
    resp = client.post("/api/v1/predict/fuel-forecast", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["station"] == "Bharati"
    assert data["current_stock_l"] == 72400.0
    assert data["predicted_burn_l_per_day"] > 0
    assert "day_7" in data["projection"]
    assert "day_30" in data["projection"]
    assert "risk" in data

def test_coldchain_anomaly_detection():
    payload = {
        "cargo_id": "ICE-CORE-204",
        "temperatures": [-80.0, -79.0, -80.0, -81.0, -80.0, -79.0, -77.0, -74.0, -70.0, -68.0],
        "target_temp_c": -80.0,
        "breach_margin_c": 5.0
    }
    resp = client.post("/api/v1/predict/coldchain-anomaly", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["cargo_id"] == "ICE-CORE-204"
    assert data["current_temperature_c"] == -68.0
    assert "trend_anomaly_detected" in data
    assert "anomaly_score" in data
    assert "action" in data

def test_sar_incident_risk():
    payload = {
        "incident_id": "Field-Team-07",
        "distance_km": 43.0,
        "visibility_m": 180.0,
        "wind_kmh": 104.0,
        "temperature_c": -39.0,
        "personnel_available": 6,
        "asset_fuel_pct": 70.0,
        "time_since_contact_hr": 5.0,
        "asset_type": "snowcat"
    }
    resp = client.post("/api/v1/predict/sar-risk", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["incident_id"] == "Field-Team-07"
    assert "response_risk_pct" in data
    assert "estimated_response_time_min" in data
    assert "risk_level" in data

def test_sar_asset_suitability_ranking():
    payload = {
        "assets": [
            {
                "name": "Helicopter A",
                "distance_km": 80.0,
                "fuel_pct": 75.0,
                "weather_compat_pct": 45.0,
                "availability": "WEATHER_LIMITED",
                "payload_ok": True
            },
            {
                "name": "Snowcat B",
                "distance_km": 31.0,
                "fuel_pct": 82.0,
                "weather_compat_pct": 94.0,
                "availability": "READY",
                "payload_ok": True
            },
            {
                "name": "Snowcat C",
                "distance_km": 47.0,
                "fuel_pct": 60.0,
                "weather_compat_pct": 88.0,
                "availability": "READY",
                "payload_ok": True
            }
        ]
    }
    resp = client.post("/api/v1/predict/sar-asset-ranking", json=payload)
    assert resp.status_code == 200
    ranked = resp.json()
    assert len(ranked) == 3
    # Snowcat B is closer and has higher weather compat, so it should rank first
    assert ranked[0]["name"] == "Snowcat B"
    assert ranked[0]["suitability_pct"] > ranked[2]["suitability_pct"]
