import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ONLINE"

def test_login_success():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@polaris.gov.in", "password": "Polaris2026!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "super_admin"

def test_login_invalid_password():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@polaris.gov.in", "password": "WrongPassword"}
    )
    assert response.status_code == 401

def test_dashboard_summary():
    # Login
    auth_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@polaris.gov.in", "password": "Polaris2026!"}
    )
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get dashboard
    resp = client.get("/api/v1/dashboard/summary", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "kpis" in data
    assert data["kpis"]["active_expeditions"] >= 1

def test_cargo_and_inventory():
    auth_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "logistics@polaris.gov.in", "password": "Polaris2026!"}
    )
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Cargo list
    cargo_resp = client.get("/api/v1/cargo", headers=headers)
    assert cargo_resp.status_code == 200
    cargo_items = cargo_resp.json()
    assert len(cargo_items) > 0
    
    # Inventory list
    inv_resp = client.get("/api/v1/inventory", headers=headers)
    assert inv_resp.status_code == 200
    assert len(inv_resp.json()) > 0

def test_create_personnel_and_muster():
    auth_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@polaris.gov.in", "password": "Polaris2026!"}
    )
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    import uuid
    unique_code = f"TEST-{uuid.uuid4().hex[:6]}"
    test_payload = {
        "badge_number": unique_code,
        "full_name": "Commander Ramesh Varma",
        "role": "Deep Glaciology Specialist",
        "organization": "NCPOR",
        "blood_group": "AB+ve",
        "medical_clearance": "Class-1 Polar Cleared",
        "tactical_callsign": "TAC-07",
        "status": "On Station",
        "biometric_muster_passed": True
    }
    
    create_resp = client.post("/api/v1/personnel", json=test_payload, headers=headers)
    assert create_resp.status_code == 201, f"Failed to create personnel: {create_resp.text}"
    person = create_resp.json()
    assert person["name"] == "Commander Ramesh Varma"
    assert person["personnel_code"] == unique_code
    assert person["role"] == "Deep Glaciology Specialist"
    assert person["blood_group"] == "AB+ve"

    # Test muster record
    muster_resp = client.post(f"/api/v1/personnel/{person['id']}/muster?passed=true", headers=headers)
    assert muster_resp.status_code == 200
    assert muster_resp.json()["passed"] is True

def test_incident_update_and_action_log():
    auth_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "emergency@polaris.gov.in", "password": "Polaris2026!"}
    )
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Get incidents
    incidents_resp = client.get("/api/v1/emergency/incidents", headers=headers)
    assert incidents_resp.status_code == 200
    incidents = incidents_resp.json()
    assert len(incidents) > 0
    target_id = incidents[0]["id"]
    
    # 2. Add update log using alias fields (update_text, reported_by)
    update_payload = {
        "update_text": "SAR Snowcat PB-01 dispatched to crevasse quadrant 4.",
        "reported_by": "Emergency Response Commander"
    }
    log_resp = client.post(f"/api/v1/emergency/incidents/{target_id}/updates", json=update_payload, headers=headers)
    assert log_resp.status_code == 200, f"Failed: {log_resp.text}"
    log_data = log_resp.json()
    assert log_data["message"] == "SAR Snowcat PB-01 dispatched to crevasse quadrant 4."
    assert log_data["created_by"] == "Emergency Response Commander"


