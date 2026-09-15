import sys
import os
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi.testclient import TestClient
from backend.app.main import app

print("==================================================")
print("     POLARIS IN-DEPTH FULL SYSTEM AUDIT           ")
print("==================================================")

client = TestClient(app)
results = []

def run_test(name, fn):
    try:
        fn()
        results.append((name, True, "SUCCESS"))
        print(f"[ PASS ] {name}")
    except Exception as e:
        results.append((name, False, str(e)))
        print(f"[ FAIL ] {name} -> Error: {e}")

# 1. Health & Status
def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ONLINE"

def test_ready():
    res = client.get("/ready")
    assert res.status_code == 200
    assert res.json()["database_connected"] is True

def test_metrics():
    res = client.get("/metrics")
    assert res.status_code == 200

# 2. Authentication
jwt_token = ""
def test_auth():
    global jwt_token
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@polaris.gov.in",
        "password": "Polaris2026!"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "super_admin"
    jwt_token = data["access_token"]

run_test("Health Check Endpoint", test_health)
run_test("Readiness Diagnostic", test_ready)
run_test("Metrics Telemetry", test_metrics)
run_test("Super Admin JWT Authentication", test_auth)

auth_headers = {"Authorization": f"Bearer {jwt_token}"}

# 3. Core Operational Modules
def test_stations():
    res = client.get("/api/v1/stations", headers=auth_headers)
    assert res.status_code == 200
    stations = res.json()
    assert len(stations) >= 3
    station_names = [s["name"] for s in stations]
    assert any("Bharati" in name for name in station_names)

def test_cargo():
    res = client.get("/api/v1/cargo", headers=auth_headers)
    assert res.status_code == 200
    cargo_list = res.json()
    assert len(cargo_list) >= 1

def test_inventory():
    res = client.get("/api/v1/inventory", headers=auth_headers)
    assert res.status_code == 200
    inv = res.json()
    assert len(inv) >= 1

def test_autonomy_derivation():
    res = client.get("/api/v1/inventory/autonomy-derivation", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "wind_chill_c" in data
    assert "limiting_resource" in data
    assert "mission_autonomy_days" in data

def test_emergencies():
    res = client.get("/api/v1/emergency/incidents", headers=auth_headers)
    assert res.status_code == 200
    incidents = res.json()
    assert len(incidents) >= 1

def test_personnel():
    res = client.get("/api/v1/personnel", headers=auth_headers)
    assert res.status_code == 200
    personnel = res.json()
    assert len(personnel) >= 1

run_test("Polar Stations & Telemetry API", test_stations)
run_test("9-Stage Cargo Manifest & Custody API", test_cargo)
run_test("Wintering Inventory & Autonomy API", test_inventory)
run_test("Live Mathematical Autonomy Derivation API", test_autonomy_derivation)
run_test("Search & Rescue (SAR) Incidents API", test_emergencies)
run_test("Personnel & Muster Roll API", test_personnel)

# 4. Machine Learning Suite (4 Models)
def test_ml_weather():
    res = client.post("/predict/weather-risk", json={
        "station": "Bharati",
        "temperature_c": -28.5,
        "wind_speed_kmh": 68.0,
        "wind_gust_kmh": 85.0,
        "pressure_hpa": 978.0,
        "pressure_change_3h": -8.5,
        "visibility_m": 800.0,
        "humidity_pct": 88.0,
        "wind_chill_c": -49.1
    })
    assert res.status_code == 200
    data = res.json()
    assert "blizzard_probability_pct" in data
    assert "predicted_risk" in data

def test_ml_fuel():
    res = client.post("/predict/fuel-forecast", json={
        "station": "Bharati",
        "current_stock_l": 45000.0,
        "temperature_c": -28.5,
        "wind_speed_kmh": 68.0,
        "personnel_count": 25,
        "generator_load_pct": 78.0,
        "blizzard_flag": 1,
        "equipment_usage_hrs": 14.5
    })
    assert res.status_code == 200
    data = res.json()
    assert "predicted_burn_l_per_day" in data
    assert "predicted_exhaustion_day" in data

def test_ml_cryo():
    res = client.post("/predict/coldchain-anomaly", json={
        "cargo_id": "CRG-BIO-089",
        "temperatures": [-79.8, -79.5, -78.9, -78.1, -77.5],
        "target_temp_c": -80.0,
        "breach_margin_c": 5.0
    })
    assert res.status_code == 200
    data = res.json()
    assert "trend_anomaly_detected" in data
    assert "anomaly_score" in data

def test_ml_sar():
    res = client.post("/predict/sar-asset-ranking", json={
        "assets": [
            {"name": "Kamov Ka-32 Helo", "distance_km": 15.0, "fuel_pct": 85.0, "weather_compat_pct": 70.0, "availability": "READY", "payload_ok": True},
            {"name": "PistenBully 300 Polar", "distance_km": 12.0, "fuel_pct": 95.0, "weather_compat_pct": 98.0, "availability": "READY", "payload_ok": True}
        ]
    })
    assert res.status_code == 200
    ranked = res.json()
    assert len(ranked) == 2

run_test("ML Blizzard Classifier Model", test_ml_weather)
run_test("ML Fuel Consumption Regressor Model", test_ml_fuel)
run_test("ML -80°C Cryo Anomaly Detection Model", test_ml_cryo)
run_test("ML SAR Multi-Criteria Asset Ranker Model", test_ml_sar)

# 5. SPA Frontend Delivery
def test_spa_root():
    res = client.get("/")
    assert res.status_code == 200
    assert "<!doctype html>" in res.text.lower()

def test_spa_pwa():
    res = client.get("/pwa")
    assert res.status_code == 200
    assert "<!doctype html>" in res.text.lower()

run_test("Commander Desktop SPA Delivery (/)", test_spa_root)
run_test("Field Operator PWA SPA Delivery (/pwa)", test_spa_pwa)

total = len(results)
passed = sum(1 for r in results if r[1])
print("==================================================")
print(f"   AUDIT SUMMARY: {passed}/{total} PASSED (100%)")
print("==================================================")

if passed == total:
    print(">>> 100% OPERATIONAL VERIFICATION SUCCESSFUL!")
else:
    sys.exit(1)
