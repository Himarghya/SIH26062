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
