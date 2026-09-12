from datetime import datetime, timedelta
from backend.app.db.session import SessionLocal, Base, engine
from backend.app.db.models import (
    Role, User, Station, Expedition, Personnel, Asset, Cargo, CargoTrackingEvent,
    InventoryItem, InventoryTransaction, EmergencyIncident, IncidentAssignment,
    IncidentUpdate, Notification, AuditLog
)
from backend.app.core.security import get_password_hash

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 1. Seed Roles
    roles_data = [
        {"name": "super_admin", "description": "Full system administrator access"},
        {"name": "expedition_manager", "description": "Mission planning, personnel and asset assignment"},
        {"name": "logistics_officer", "description": "Cargo manifests, transport, tracking and deliveries"},
        {"name": "station_manager", "description": "Station inventory, stock movements, and base personnel"},
        {"name": "emergency_coordinator", "description": "Emergency incident command, SAR resource assignment"},
        {"name": "viewer", "description": "Read-only access to operational dashboards and reports"},
    ]
    
    roles_map = {}
    for r in roles_data:
        role = db.query(Role).filter(Role.name == r["name"]).first()
        if not role:
            role = Role(name=r["name"], description=r["description"])
            db.add(role)
            db.flush()
        roles_map[r["name"]] = role

    # 2. Seed Demo Users
    demo_password_hash = get_password_hash("Polaris2026!")
    demo_users = [
        {"email": "admin@polaris.gov.in", "name": "Dr. Demo Administrator (Director NCPOR)", "role": "super_admin"},
        {"email": "expedition@polaris.gov.in", "name": "Demo Expedition Director", "role": "expedition_manager"},
        {"email": "logistics@polaris.gov.in", "name": "Demo Logistics Officer", "role": "logistics_officer"},
        {"email": "station@polaris.gov.in", "name": "Demo Station Commander (Bharati)", "role": "station_manager"},
        {"email": "emergency@polaris.gov.in", "name": "Demo SAR Emergency Commander", "role": "emergency_coordinator"},
        {"email": "viewer@polaris.gov.in", "name": "Demo MoES Scientific Analyst", "role": "viewer"},
    ]
    
    for u in demo_users:
        user = db.query(User).filter(User.email == u["email"]).first()
        if not user:
            user = User(
                email=u["email"],
                name=u["name"],
                password_hash=demo_password_hash,
                role_id=roles_map[u["role"]].id,
                is_active=True
            )
            db.add(user)

    # 3. Seed Research Stations
    stations_data = [
        {
            "name": "Bharati Research Station",
            "code": "BHR-ANT",
            "region": "Antarctica",
            "location_name": "Larsemann Hills, East Antarctica",
            "latitude": -69.4075,
            "longitude": 76.1908,
            "elevation_m": 35.0,
            "capacity": 47,
            "active_personnel": 24,
            "status": "Operational",
            "temperature_c": -28.5,
            "wind_speed_kmh": 68.0,
            "blizzard_level": "STAGE_1_ADVISORY"
        },
        {
            "name": "Maitri Research Station",
            "code": "MTR-ANT",
            "region": "Antarctica",
            "location_name": "Schirmacher Oasis, Dronning Maud Land",
            "latitude": -70.7667,
            "longitude": 11.7333,
            "elevation_m": 117.0,
            "capacity": 65,
            "active_personnel": 25,
            "status": "Operational",
            "temperature_c": -22.0,
            "wind_speed_kmh": 42.0,
            "blizzard_level": "NORMAL"
        },
        {
            "name": "Himadri Research Station",
            "code": "HMD-ARC",
            "region": "Arctic",
            "location_name": "Ny-Ålesund, Spitsbergen, Svalbard, Norway",
            "latitude": 78.9235,
            "longitude": 11.9333,
            "elevation_m": 15.0,
            "capacity": 12,
            "active_personnel": 8,
            "status": "Operational",
            "temperature_c": -14.2,
            "wind_speed_kmh": 28.0,
            "blizzard_level": "NORMAL"
        },
        {
            "name": "IndARC Mooring Observatory",
            "code": "ARC-OBS-01",
            "region": "Arctic",
            "location_name": "Kongsfjorden Fjord Subsurface Mooring",
            "latitude": 78.9000,
            "longitude": 12.0000,
            "elevation_m": -192.0,
            "capacity": 0,
            "active_personnel": 0,
            "status": "Operational",
            "temperature_c": -1.8,
            "wind_speed_kmh": 15.0,
            "blizzard_level": "NORMAL"
        }
    ]

    stn_map = {}
    for s in stations_data:
        stn = Station(**s)
        db.add(stn)
        db.flush()
        stn_map[s["code"]] = stn

    # 4. Seed Expeditions
    expeditions_data = [
        {
            "expedition_code": "ISEA-44",
            "name": "44th Indian Scientific Expedition to Antarctica",
            "description": "Annual deep Antarctic overwintering, deep ice-core drilling, climate observatory modernization at Larsemann Hills.",
            "region": "Antarctica",
            "destination": "Bharati & Maitri Stations",
            "mission_type": "Scientific Research & Deep Core Drilling",
            "start_date": datetime.utcnow() - timedelta(days=90),
            "end_date": datetime.utcnow() + timedelta(days=275),
            "status": "Active",
            "priority": "High",
            "budget_crores": 88.5,
            "cargo_quota_tons": 5200.0,
            "risk_index": 7
        },
        {
            "expedition_code": "ARCTIC-2026",
            "name": "Indian Arctic Scientific Expedition 2026",
            "description": "High-Arctic fjord biogeochemical monitoring, aerosol profiling, and fjord hydrography at Ny-Ålesund.",
            "region": "Arctic",
            "destination": "Himadri Station & IndARC Mooring",
            "mission_type": "Fjord Hydrography & Atmospheric Sampling",
            "start_date": datetime.utcnow() - timedelta(days=30),
            "end_date": datetime.utcnow() + timedelta(days=150),
            "status": "Active",
            "priority": "High",
            "budget_crores": 18.2,
            "cargo_quota_tons": 350.0,
            "risk_index": 5
        }
    ]

    exp_map = {}
    for e in expeditions_data:
        exp = Expedition(**e)
        db.add(exp)
        db.flush()
        exp_map[e["expedition_code"]] = exp

    # 5. Seed Assets
    assets_data = [
        {
            "asset_code": "VSL-VASILIY",
            "name": "MV Vasiliy Golovnin (Chartered Icebreaker)",
            "asset_type": "Ship",
            "owner_organization": "NCPOR Charter",
            "status": "Operational",
            "current_location": "Southern Ocean (En route to Larsemann Hills)",
            "latitude": -55.2000,
            "longitude": 52.4000,
            "heading_deg": 165.0,
            "speed_knots": 14.2,
            "capacity_tons": 6500.0,
            "fuel_pct": 82.0,
            "assigned_expedition_id": exp_map["ISEA-44"].id
        },
        {
            "asset_code": "AIR-KAMOV-01",
            "name": "Kamov Ka-32A Heavy Lift Helicopter",
            "asset_type": "Aircraft",
            "owner_organization": "Indian Air Force Support to NCPOR",
            "status": "Operational",
            "current_location": "Helipad Deck, MV Vasiliy Golovnin",
            "latitude": -55.2000,
            "longitude": 52.4000,
            "heading_deg": 0.0,
            "speed_knots": 0.0,
            "capacity_tons": 5.0,
            "fuel_pct": 95.0,
            "assigned_expedition_id": exp_map["ISEA-44"].id
        },
        {
            "asset_code": "VEH-PISTEN-04",
            "name": "PistenBully 300 Polar Heavy Tracked Snowcat",
            "asset_type": "Vehicle",
            "owner_organization": "NCPOR Logistics",
            "status": "Operational",
            "current_location": "Bharati Vehicle Maintenance Garage",
            "latitude": -69.4075,
            "longitude": 76.1908,
            "heading_deg": 240.0,
            "speed_knots": 0.0,
            "capacity_tons": 4.5,
            "fuel_pct": 88.0,
            "assigned_expedition_id": exp_map["ISEA-44"].id
        }
    ]

    for a in assets_data:
        ast = Asset(**a)
        db.add(ast)

    # 6. Seed Cargo Manifests
    cargo_data = [
        {
            "cargo_code": "CRG-DRILL-001",
            "barcode": "890126062001",
            "name": "Multi-Channel Electro-Mechanical Ice Core Drill System",
            "category": "Scientific equipment",
            "description": "500-meter electromechanical coring system with core barrel spares and cutting heads.",
            "quantity": 1,
            "weight_kg": 2450.0,
            "volume_m3": 12.5,
            "origin": "Goa Port Staging Complex",
            "destination_station_id": stn_map["BHR-ANT"].id,
            "expedition_id": exp_map["ISEA-44"].id,
            "status": "In Transit",
            "priority": "Mission Critical",
            "is_cold_chain": False,
            "hazard_type": "None",
            "current_location": "Cargo Hold 2, MV Vasiliy Golovnin"
        },
        {
            "cargo_code": "CRG-BIO-002",
            "barcode": "890126062002",
            "name": "Antarctic Cryophilic Bacterial Strains & Subglacial Water Samples",
            "category": "Scientific equipment",
            "description": "Microbiological samples in vacuum cryo-shippers requiring uninterrupted -80°C preservation.",
            "quantity": 4,
            "weight_kg": 180.0,
            "volume_m3": 1.2,
            "origin": "Goa Port Cryo Vault",
            "destination_station_id": stn_map["BHR-ANT"].id,
            "expedition_id": exp_map["ISEA-44"].id,
            "status": "In Transit",
            "priority": "Mission Critical",
            "is_cold_chain": True,
            "temp_min_c": -85.0,
            "temp_max_c": -70.0,
            "current_temp_c": -78.5,
            "is_temp_violated": False,
            "hazard_type": "Cryogenic",
            "current_location": "Cryo Vault Room A, MV Vasiliy Golovnin"
        },
        {
            "cargo_code": "CRG-FUEL-003",
            "barcode": "890126062003",
            "name": "Special Polar Grade Diesel (D-10 High Flash / 45,000L)",
            "category": "Fuel",
            "description": "Special low-temperature diesel blended with pour-point depressants to prevent clouding at -50°C.",
            "quantity": 45000,
            "weight_kg": 38250.0,
            "volume_m3": 45.0,
            "origin": "IOCL Mormugao Bunkering",
            "destination_station_id": stn_map["BHR-ANT"].id,
            "expedition_id": exp_map["ISEA-44"].id,
            "status": "In Transit",
            "priority": "Mission Critical",
            "is_cold_chain": False,
            "hazard_type": "Class 3 Flammable",
            "current_location": "Fuel Tanker Hold 4, MV Vasiliy Golovnin"
        }
    ]

    for c in cargo_data:
        crg = Cargo(**c)
        db.add(crg)
        db.flush()

        # Seed initial tracking event
        evt = CargoTrackingEvent(
            cargo_id=crg.id,
            status="In Transit",
            location=crg.current_location,
            handler_id="Officer-in-Charge",
            scan_method="Optical 2D DataMatrix",
            temperature_at_handover=-78.5 if crg.is_cold_chain else None,
            notes="Passed port manifest and vessel loading manifest verification."
        )
        db.add(evt)

    # 7. Seed Inventory Items
    inv_data = [
        {
            "item_code": "POL-DSL-D10",
            "name": "Polar Diesel D-10 (-50°C Antifreeze Blend)",
            "category": "Polar Fuel",
            "station_id": stn_map["BHR-ANT"].id,
            "quantity": 185000.0,
            "unit": "Liters",
            "minimum_stock": 75000.0,
            "reorder_threshold": 95000.0,
            "burn_rate_per_day": 450.0,
            "storage_location": "Bharati Main Bulk Fuel Farm (Tanks 1-4)"
        },
        {
            "item_code": "RAT-MRE-POLAR",
            "name": "High-Calorie Polar MRE Survival Rations (4,500 kcal/pack)",
            "category": "Survival Food",
            "station_id": stn_map["BHR-ANT"].id,
            "quantity": 1820.0,
            "unit": "Packs",
            "minimum_stock": 600.0,
            "reorder_threshold": 900.0,
            "burn_rate_per_day": 24.0,
            "storage_location": "Sub-Zero Emergency Food Bunker B"
        },
        {
            "item_code": "MED-O2-CYL",
            "name": "Medical Grade Oxygen Cylinders (47L / 150 bar)",
            "category": "Medical",
            "station_id": stn_map["BHR-ANT"].id,
            "quantity": 38.0,
            "unit": "Cylinders",
            "minimum_stock": 15.0,
            "reorder_threshold": 20.0,
            "burn_rate_per_day": 0.1,
            "storage_location": "Station Medical Bay Vault"
        }
    ]

    for item in inv_data:
        inv = InventoryItem(**item)
        db.add(inv)

    # 8. Seed Emergency Incident
    emg = EmergencyIncident(
        incident_code="SOS-BHR-2026-01",
        title="Field Sortie Crevasse Hazard & Stage-3 Blizzard Advisory",
        incident_type="Severe Weather",
        description="Severe sudden katabatic blizzard with wind gusting at 92 km/h near Dålk Glacier. Sortie team recalled to shelter.",
        severity="High",
        status="Team Assigned",
        escalation_level=4,
        latitude=-69.4500,
        longitude=76.2500,
        station_id=stn_map["BHR-ANT"].id,
        expedition_id=exp_map["ISEA-44"].id
    )
    db.add(emg)
    db.flush()

    upd = IncidentUpdate(
        incident_id=emg.id,
        status="Team Assigned",
        message="Station Commander triggered Sortie Recall protocol. Emergency SAR unit assigned.",
        created_by="Station Commander"
    )
    db.add(upd)

    # 9. Seed Audit Log with SHA-256 Hash
    audit = AuditLog(
        user_email="admin@polaris.gov.in",
        action="SYSTEM_INIT_SEED",
        entity_type="SYSTEM",
        entity_id="GLOBAL",
        metadata_json='{"status": "initialized", "stations": 4}',
        previous_hash="0000000000000000000000000000000000000000000000000000000000000000",
        current_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    )
    db.add(audit)

    db.commit()
    db.close()
    print("POLARIS database seeded with realistic polar dataset and demo accounts.")

if __name__ == "__main__":
    seed_database()
