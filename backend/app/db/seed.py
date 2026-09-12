from datetime import datetime, timedelta
from backend.app.db.session import SessionLocal, Base, engine
from backend.app.db.models import (
    Role, User, Station, Expedition, Personnel, Asset, Cargo, CargoTrackingEvent,
    InventoryItem, InventoryTransaction, EmergencyIncident, IncidentAssignment,
    IncidentUpdate, Notification, AuditLog
)
from backend.app.core.security import get_password_hash

def seed_database():
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
        {"email": "admin@polaris.gov.in", "name": "Dr. Arvind Swaminathan (Director NCPOR)", "role": "super_admin"},
        {"email": "expedition@polaris.gov.in", "name": "Dr. Meera Nambiar (Expedition Leader)", "role": "expedition_manager"},
        {"email": "logistics@polaris.gov.in", "name": "Wg Cdr Tarun Jaswal (Logistics Lead)", "role": "logistics_officer"},
        {"email": "station@polaris.gov.in", "name": "Er. Sandeep Bopche (Station Commander)", "role": "station_manager"},
        {"email": "emergency@polaris.gov.in", "name": "Capt. R. Deshmukh (SAR Coordinator)", "role": "emergency_coordinator"},
        {"email": "viewer@polaris.gov.in", "name": "Aditi Sharma (MoES Analyst)", "role": "viewer"},
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
            "longitude": 76.1942,
            "elevation_m": 35.0,
            "capacity": 47,
            "active_personnel": 24,
            "status": "Wintering",
            "temperature_c": -28.4,
            "wind_speed_kmh": 42.0,
            "blizzard_level": "NORMAL"
        },
        {
            "name": "Maitri Research Station",
            "code": "MTR-ANT",
            "region": "Antarctica",
            "location_name": "Schirmacher Oasis, Queen Maud Land",
            "latitude": -70.7667,
            "longitude": 11.7333,
            "elevation_m": 117.0,
            "capacity": 40,
            "active_personnel": 22,
            "status": "Wintering",
            "temperature_c": -32.1,
            "wind_speed_kmh": 58.0,
            "blizzard_level": "STAGE_1_ADVISORY"
        },
        {
            "name": "Himadri Research Station",
            "code": "HMD-ARC",
            "region": "Arctic",
            "location_name": "Ny-Ålesund, Spitsbergen, Svalbard",
            "latitude": 78.9235,
            "longitude": 11.9099,
            "elevation_m": 12.0,
            "capacity": 15,
            "active_personnel": 8,
            "status": "Operational",
            "temperature_c": -14.6,
            "wind_speed_kmh": 24.0,
            "blizzard_level": "NORMAL"
        },
        {
            "name": "IndARC Mooring System",
            "code": "IND-ARC",
            "region": "Arctic",
            "location_name": "Kongsfjorden Fjord Sub-Surface",
            "latitude": 78.9812,
            "longitude": 12.0124,
            "elevation_m": -192.0,
            "capacity": 0,
            "active_personnel": 0,
            "status": "Operational",
            "temperature_c": -1.2,
            "wind_speed_kmh": 18.0,
            "blizzard_level": "NORMAL"
        }
    ]
    
    station_objs = {}
    for st in stations_data:
        station = db.query(Station).filter(Station.code == st["code"]).first()
        if not station:
            station = Station(**st)
            db.add(station)
            db.flush()
        station_objs[st["code"]] = station

    # 4. Seed Expeditions
    exp_data = [
        {
            "expedition_code": "ISEA-44",
            "name": "44th Indian Scientific Expedition to Antarctica",
            "description": "Cryospheric dynamics, paleoclimate shallow ice core drilling, and environmental baseline monitoring at Larsemann Hills & Schirmacher Oasis.",
            "region": "Antarctica",
            "destination": "Bharati & Maitri Stations",
            "mission_type": "Deep Ice Core Paleoclimate & Atmospheric Genomics",
            "start_date": datetime(2025, 11, 15),
            "end_date": datetime(2026, 12, 10),
            "status": "Active",
            "priority": "Critical",
            "budget_crores": 88.5,
            "cargo_quota_tons": 4100.0,
            "risk_index": 7
        },
        {
            "expedition_code": "ARC-2026-S",
            "name": "Indian Arctic Spring-Summer Expedition 2026",
            "description": "Long-term atmospheric aerosol profiling, marine biogeochemistry in Kongsfjorden, and IndARC mooring deployment.",
            "region": "Arctic",
            "destination": "Himadri Station, Svalbard",
            "mission_type": "Aerosol Teleconnections & Marine CTD Profiling",
            "start_date": datetime(2026, 3, 1),
            "end_date": datetime(2026, 9, 30),
            "status": "Active",
            "priority": "High",
            "budget_crores": 14.2,
            "cargo_quota_tons": 320.0,
            "risk_index": 4
        }
    ]
    
    exp_objs = {}
    for e in exp_data:
        exp = db.query(Expedition).filter(Expedition.expedition_code == e["expedition_code"]).first()
        if not exp:
            exp = Expedition(**e)
            db.add(exp)
            db.flush()
        exp_objs[e["expedition_code"]] = exp

    # 5. Seed Assets
    assets_data = [
        {
            "asset_code": "VSL-VASILIY",
            "name": "MV Vasiliy Golovnin (Chartered Icebreaker)",
            "asset_type": "Ship",
            "owner_organization": "FESCO / NCPOR Charter",
            "status": "In Transit",
            "current_location": "Southern Ocean (58°S, 64°E)",
            "latitude": -58.1200,
            "longitude": 64.3000,
            "assigned_expedition_id": exp_objs["ISEA-44"].id,
            "capacity_tons": 4200.0,
            "fuel_pct": 84.0
        },
        {
            "asset_code": "VSL-SAGARKANYA",
            "name": "ORV Sagar Kanya",
            "asset_type": "Ship",
            "owner_organization": "MoES / NCPOR",
            "status": "Operational",
            "current_location": "Goa Port Complex",
            "latitude": 15.4000,
            "longitude": 73.8000,
            "capacity_tons": 1500.0,
            "fuel_pct": 92.0
        },
        {
            "asset_code": "AIR-KAMOV-1",
            "name": "Kamov Ka-32 Polar Airlift Helicopter (VT-NCP1)",
            "asset_type": "Aircraft",
            "owner_organization": "Pawan Hans / NCPOR",
            "status": "Available",
            "current_location": "Bharati Station Helipad",
            "latitude": -69.4070,
            "longitude": 76.1950,
            "assigned_expedition_id": exp_objs["ISEA-44"].id,
            "capacity_tons": 4.5,
            "fuel_pct": 90.0
        },
        {
            "asset_code": "VEH-PISTENBULLY",
            "name": "PistenBully 300 Polar Heavy Snowcat",
            "asset_type": "Vehicle",
            "owner_organization": "NCPOR",
            "status": "Operational",
            "current_location": "Maitri Workshop Hangar",
            "latitude": -70.7660,
            "longitude": 11.7340,
            "assigned_expedition_id": exp_objs["ISEA-44"].id,
            "capacity_tons": 6.0,
            "fuel_pct": 78.0
        }
    ]
    
    asset_objs = {}
    for a in assets_data:
        asset = db.query(Asset).filter(Asset.asset_code == a["asset_code"]).first()
        if not asset:
            asset = Asset(**a)
            db.add(asset)
            db.flush()
        asset_objs[a["asset_code"]] = asset

    # 6. Seed Cargo Manifests
    cargo_data = [
        {
            "cargo_code": "CRG-BHR-001",
            "barcode": "890126062001",
            "name": "Multi-Channel Ice Core Drill Unit Mk-IV",
            "category": "Scientific equipment",
            "description": "Sub-zero shallow paleoclimate ice corer with 500m titanium drill string.",
            "quantity": 1.0,
            "unit": "Units",
            "weight_kg": 2850.0,
            "volume_m3": 9.4,
            "origin": "NCPOR Logistics Complex, Goa",
            "destination_station_id": station_objs["BHR-ANT"].id,
            "expedition_id": exp_objs["ISEA-44"].id,
            "assigned_asset_id": asset_objs["VSL-VASILIY"].id,
            "status": "In Transit",
            "priority": "Mission Critical",
            "is_cold_chain": False,
            "current_location": "Vessel Hold - MV Vasiliy Golovnin"
        },
        {
            "cargo_code": "CRG-BHR-002",
            "barcode": "890126062002",
            "name": "Antarctic Cryophilic Bacterial Strains & Algal Cores",
            "category": "Scientific equipment",
            "description": "Biological cryo-specimens requiring continuous sub-zero deep freeze.",
            "quantity": 4.0,
            "unit": "Cryo-Boxes",
            "weight_kg": 140.0,
            "volume_m3": 0.8,
            "origin": "Larsemann Hills Field Camp 3",
            "destination_station_id": station_objs["BHR-ANT"].id,
            "expedition_id": exp_objs["ISEA-44"].id,
            "status": "Delivered",
            "priority": "Mission Critical",
            "is_cold_chain": True,
            "temp_min_c": -85.0,
            "temp_max_c": -75.0,
            "current_temp_c": -79.4,
            "is_temp_violated": False,
            "current_location": "Bharati Cryo Vault Bay 4"
        },
        {
            "cargo_code": "CRG-MTR-003",
            "barcode": "890126062003",
            "name": "Special Low Pour Point Polar Diesel (D-10 / -50°C Cloud Point)",
            "category": "Fuel",
            "description": "Anti-freezing diesel for station power generators.",
            "quantity": 45000.0,
            "unit": "Liters",
            "weight_kg": 38000.0,
            "volume_m3": 45.0,
            "origin": "IOCL Mormugao Terminal",
            "destination_station_id": station_objs["MTR-ANT"].id,
            "expedition_id": exp_objs["ISEA-44"].id,
            "assigned_asset_id": asset_objs["VSL-VASILIY"].id,
            "status": "In Transit",
            "priority": "Mission Critical",
            "is_cold_chain": False,
            "current_location": "Vessel ISO Tank 4"
        }
    ]
    
    for c in cargo_data:
        cargo = db.query(Cargo).filter(Cargo.cargo_code == c["cargo_code"]).first()
        if not cargo:
            cargo = Cargo(**c)
            db.add(cargo)
            db.flush()
            db.add(CargoTrackingEvent(
                cargo_id=cargo.id,
                status=cargo.status,
                location=cargo.current_location,
                recorded_by="System Seeder",
                notes="Initial manifest registration"
            ))

    # 7. Seed Inventory Items
    inv_data = [
        {
            "item_code": "SKU-DSL-D10",
            "name": "Polar Special Diesel (D-10 / -50°C Cloud Point)",
            "category": "Polar Fuel",
            "station_id": station_objs["BHR-ANT"].id,
            "quantity": 184500.0,
            "unit": "Liters",
            "minimum_stock": 80000.0,
            "reorder_threshold": 120000.0,
            "burn_rate_per_day": 480.0,
            "storage_location": "East Fuel Farm Tanks 1-4"
        },
        {
            "item_code": "SKU-JET-A1",
            "name": "Aviation Turbine Fuel (Jet A-1 for Ka-32 Helo)",
            "category": "Polar Fuel",
            "station_id": station_objs["BHR-ANT"].id,
            "quantity": 42000.0,
            "unit": "Liters",
            "minimum_stock": 15000.0,
            "reorder_threshold": 25000.0,
            "burn_rate_per_day": 120.0,
            "storage_location": "Helipad Underground Vault"
        },
        {
            "item_code": "SKU-MRE-SURV",
            "name": "High-Calorie Freeze-Dried Survival Ration Packs (4,500 kcal)",
            "category": "Survival Food",
            "station_id": station_objs["BHR-ANT"].id,
            "quantity": 13680.0,
            "unit": "Packs",
            "minimum_stock": 4000.0,
            "reorder_threshold": 6000.0,
            "burn_rate_per_day": 48.0,
            "storage_location": "Emergency Provisions Vault 2"
        },
        {
            "item_code": "SKU-MED-O2",
            "name": "Hyperbaric Medical Oxygen Cylinders (50L)",
            "category": "Medical",
            "station_id": station_objs["MTR-ANT"].id,
            "quantity": 14.0,
            "unit": "Cylinders",
            "minimum_stock": 10.0,
            "reorder_threshold": 18.0,
            "burn_rate_per_day": 0.1,
            "storage_location": "Hospital Medical Bay"
        },
        {
            "item_code": "SKU-GEN-INJ",
            "name": "Cummins Diesel Generator Fuel Injector Assemblies",
            "category": "Generator Spares",
            "station_id": station_objs["MTR-ANT"].id,
            "quantity": 6.0,
            "unit": "Units",
            "minimum_stock": 8.0,
            "reorder_threshold": 12.0,
            "burn_rate_per_day": 0.05,
            "storage_location": "Workshop Spare Rack 7"
        }
    ]
    
    for item in inv_data:
        inv = db.query(InventoryItem).filter(
            InventoryItem.item_code == item["item_code"],
            InventoryItem.station_id == item["station_id"]
        ).first()
        if not inv:
            inv = InventoryItem(**item)
            db.add(inv)
            db.flush()
            db.add(InventoryTransaction(
                inventory_item_id=inv.id,
                transaction_type="Stock In",
                quantity=inv.quantity,
                destination_location=inv.storage_location,
                performed_by="System Seeder",
                reason="Initial seed baseline stock"
            ))

    # 8. Seed Personnel
    personnel_data = [
        {
            "personnel_code": "PRS-IND-01",
            "name": "Dr. Arvind Swaminathan",
            "role": "Mission Director & Scientist-G",
            "organization": "NCPOR / MoES",
            "blood_group": "O+ve",
            "fitness_status": "Class-1 Polar Cleared",
            "assigned_expedition_id": exp_objs["ISEA-44"].id,
            "assigned_station_id": station_objs["BHR-ANT"].id,
            "current_status": "On Station",
            "assigned_shelter": "Habitation Pod A-01",
            "radio_id": "BHR-TAC-1"
        },
        {
            "personnel_code": "PRS-IND-02",
            "name": "Wg Cdr Tarun Jaswal (Retd)",
            "role": "Logistics Lead Officer",
            "organization": "Indian Air Force / NCPOR",
            "blood_group": "B+ve",
            "fitness_status": "Class-1 Polar Cleared",
            "assigned_expedition_id": exp_objs["ISEA-44"].id,
            "assigned_station_id": station_objs["BHR-ANT"].id,
            "current_status": "On Station",
            "assigned_shelter": "Logistics Center L-02",
            "radio_id": "BHR-LOG-1"
        },
        {
            "personnel_code": "PRS-IND-03",
            "name": "Dr. Ananya Roy",
            "role": "Station Surgeon & Medical Lead",
            "organization": "AIIMS New Delhi",
            "blood_group": "A+ve",
            "fitness_status": "Class-1 Polar Cleared",
            "assigned_expedition_id": exp_objs["ISEA-44"].id,
            "assigned_station_id": station_objs["BHR-ANT"].id,
            "current_status": "On Station",
            "assigned_shelter": "Medical ICU Unit",
            "radio_id": "BHR-MED-1"
        },
        {
            "personnel_code": "PRS-IND-04",
            "name": "Er. Sandeep Bopche",
            "role": "Station Commander & Chief Engineer",
            "organization": "Indian Navy / NCPOR",
            "blood_group": "AB+ve",
            "fitness_status": "Class-1 Polar Cleared",
            "assigned_expedition_id": exp_objs["ISEA-44"].id,
            "assigned_station_id": station_objs["MTR-ANT"].id,
            "current_status": "On Station",
            "assigned_shelter": "Maitri Main Command Block",
            "radio_id": "MTR-CMD-1"
        }
    ]
    
    for p in personnel_data:
        person = db.query(Personnel).filter(Personnel.personnel_code == p["personnel_code"]).first()
        if not person:
            person = Personnel(**p)
            db.add(person)

    # 9. Seed Emergency Incident
    emerg = db.query(EmergencyIncident).filter(EmergencyIncident.incident_code == "INC-2026-08").first()
    if not emerg:
        emerg = EmergencyIncident(
            incident_code="INC-2026-08",
            title="Katabatic Wind Gale Surge (68 km/h) & Stage-1 Blizzard Advisory",
            incident_type="Severe Weather",
            description="Barometric plummet to 974 hPa. Visual range restricted to under 300m at Maitri Oasis. Outdoor traverses suspended.",
            severity="Medium",
            status="In Progress",
            station_id=station_objs["MTR-ANT"].id,
            reported_by="IMD Station Meteorologist",
            reported_at=datetime.utcnow() - timedelta(hours=2)
        )
        db.add(emerg)
        db.flush()
        db.add(IncidentUpdate(
            incident_id=emerg.id,
            status="In Progress",
            message="Advisory broadcast to all outdoor teams. PistenBully recalled to base.",
            created_by="Station Commander"
        ))

    # 10. Seed Notifications
    notif = db.query(Notification).first()
    if not notif:
        db.add(Notification(
            title="⚠️ Low Stock Alert: Cummins Generator Injectors",
            message="Maitri stock (6 units) is below minimum safety threshold (8 units).",
            notification_type="Low inventory",
            severity="warning",
            link="/inventory"
        ))
        db.add(Notification(
            title="🚢 MV Vasiliy Golovnin Approaching Sea Ice",
            message="Chartered icebreaker entered Southern Ocean 58°S transect with 3,180T cargo.",
            notification_type="Cargo dispatched",
            severity="info",
            link="/cargo"
        ))

    db.commit()
    db.close()
    print("[SUCCESS] POLARIS Database successfully seeded with demo polar expedition data!")

if __name__ == "__main__":
    seed_database()
