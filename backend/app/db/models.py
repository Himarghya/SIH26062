import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(50), unique=True, nullable=False) # super_admin, expedition_manager, logistics_officer, station_manager, emergency_coordinator, viewer
    description = Column(String(255), nullable=True)
    permissions = Column(Text, nullable=True) # comma separated or JSON string
    
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(String(36), ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    role = relationship("Role", back_populates="users")
    notifications = relationship("Notification", back_populates="user")

class Station(Base):
    __tablename__ = "stations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    country = Column(String(50), default="India")
    organization = Column(String(100), default="NCPOR / Ministry of Earth Sciences")
    region = Column(String(50), default="Antarctica") # Antarctica, Arctic, Himalayas
    location_name = Column(String(150), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, default=0.0)
    capacity = Column(Integer, default=40)
    active_personnel = Column(Integer, default=0)
    status = Column(String(50), default="Operational") # Operational, Wintering, Seasonal Closure, High Alert
    temperature_c = Column(Float, default=-25.0)
    wind_speed_kmh = Column(Float, default=30.0)
    blizzard_level = Column(String(50), default="NORMAL") # NORMAL, STAGE_1_ADVISORY, STAGE_2_WARNING, STAGE_3_WHITEOUT_LOCKDOWN
    created_at = Column(DateTime, default=datetime.utcnow)

    personnel = relationship("Personnel", back_populates="assigned_station")
    inventory_items = relationship("InventoryItem", back_populates="station")

class Expedition(Base):
    __tablename__ = "expeditions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    expedition_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    region = Column(String(50), default="Antarctica")
    destination = Column(String(100), nullable=False)
    mission_type = Column(String(100), default="Scientific Research & Deep Core Drilling")
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    manager_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="Active") # Planned, Preparing, Active, Paused, Completed, Cancelled
    priority = Column(String(50), default="High") # Routine, High, Critical
    budget_crores = Column(Float, default=50.0)
    cargo_quota_tons = Column(Float, default=2000.0)
    risk_index = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    cargo_items = relationship("Cargo", back_populates="expedition")
    assets = relationship("Asset", back_populates="assigned_expedition")
    personnel = relationship("Personnel", back_populates="assigned_expedition")

class Personnel(Base):
    __tablename__ = "personnel"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    personnel_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(100), nullable=False)
    organization = Column(String(100), default="NCPOR")
    contact_information = Column(String(150), nullable=True)
    blood_group = Column(String(10), default="O+ve")
    fitness_status = Column(String(50), default="Class-1 Polar Cleared")
    survival_trained = Column(Boolean, default=True)
    current_status = Column(String(50), default="On Station") # On Station, Field Sortie, In Transit, Medical Bay
    assigned_expedition_id = Column(String(36), ForeignKey("expeditions.id"), nullable=True)
    assigned_station_id = Column(String(36), ForeignKey("stations.id"), nullable=True)
    assigned_shelter = Column(String(100), default="Main Habitation Pod Sector A")
    radio_id = Column(String(50), default="TAC-1")
    availability = Column(String(50), default="Deployed")
    last_muster_timestamp = Column(DateTime, default=datetime.utcnow)
    biometric_muster_passed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assigned_expedition = relationship("Expedition", back_populates="personnel")
    assigned_station = relationship("Station", back_populates="personnel")
    movements = relationship("PersonnelMovement", back_populates="personnel")

class PersonnelMovement(Base):
    __tablename__ = "personnel_movements"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    personnel_id = Column(String(36), ForeignKey("personnel.id"), nullable=False)
    expedition_id = Column(String(36), ForeignKey("expeditions.id"), nullable=True)
    from_location = Column(String(100), nullable=False)
    to_location = Column(String(100), nullable=False)
    movement_type = Column(String(50), nullable=False) # Departure, Arrival, Boarding, Disembarkation, Station Transfer, Check-in, Check-out
    timestamp = Column(DateTime, default=datetime.utcnow)
    recorded_by = Column(String(100), default="Station Watch Officer")
    notes = Column(Text, nullable=True)

    personnel = relationship("Personnel", back_populates="movements")

class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    asset_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    asset_type = Column(String(50), nullable=False) # Ship, Aircraft, Vehicle, Snowmobile, Scientific Equipment, Generator, Rescue Equipment
    owner_organization = Column(String(100), default="NCPOR / MoES")
    status = Column(String(50), default="Available") # Available, Assigned, In Transit, Operational, Under Maintenance, Unavailable, Retired
    current_location = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    assigned_expedition_id = Column(String(36), ForeignKey("expeditions.id"), nullable=True)
    capacity_tons = Column(Float, default=0.0)
    fuel_pct = Column(Float, default=100.0)
    last_inspection = Column(DateTime, default=datetime.utcnow)
    next_maintenance = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assigned_expedition = relationship("Expedition", back_populates="assets")
    maintenance_records = relationship("AssetMaintenance", back_populates="asset")
    cargo_items = relationship("Cargo", back_populates="assigned_asset")

class AssetMaintenance(Base):
    __tablename__ = "asset_maintenance"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    asset_id = Column(String(36), ForeignKey("assets.id"), nullable=False)
    maintenance_type = Column(String(50), nullable=False) # Scheduled Service, Polar Cold Overhaul, Rotor Inspection, Emergency Repair
    description = Column(Text, nullable=True)
    performed_by = Column(String(100), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    cost = Column(Float, default=0.0)
    result = Column(String(50), default="Passed") # Passed, Requires Followup, Failed
    next_due_date = Column(DateTime, nullable=True)

    asset = relationship("Asset", back_populates="maintenance_records")

class Cargo(Base):
    __tablename__ = "cargo"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    cargo_code = Column(String(50), unique=True, index=True, nullable=False)
    barcode = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False) # Fuel, Food, Medical supplies, Scientific equipment, Clothing, Shelter equipment, Spare parts, Communication equipment, General supplies
    description = Column(Text, nullable=True)
    quantity = Column(Float, default=1.0)
    unit = Column(String(20), default="Units")
    weight_kg = Column(Float, default=100.0)
    volume_m3 = Column(Float, default=1.0)
    origin = Column(String(100), default="Goa Port Staging Complex")
    destination_station_id = Column(String(36), ForeignKey("stations.id"), nullable=True)
    expedition_id = Column(String(36), ForeignKey("expeditions.id"), nullable=True)
    assigned_asset_id = Column(String(36), ForeignKey("assets.id"), nullable=True)
    status = Column(String(50), default="Packed") # Draft, Packed, Ready for Dispatch, Dispatched, In Transit, At Port, At Station, Delivered, Delayed, Damaged, Missing, Cancelled
    priority = Column(String(50), default="High") # Routine, High, Mission Critical
    is_cold_chain = Column(Boolean, default=False)
    temp_min_c = Column(Float, default=-85.0)
    temp_max_c = Column(Float, default=-75.0)
    current_temp_c = Column(Float, default=-80.0)
    is_temp_violated = Column(Boolean, default=False)
    hazard_type = Column(String(50), default="None") # None, Class 3 Flammable, Class 9 Lithium-Ion, Cryogenic, Bio-Preserved
    expected_delivery_date = Column(DateTime, nullable=True)
    current_location = Column(String(100), default="Goa Port Warehouse")
    special_handling_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    expedition = relationship("Expedition", back_populates="cargo_items")
    assigned_asset = relationship("Asset", back_populates="cargo_items")
    tracking_events = relationship("CargoTrackingEvent", back_populates="cargo")

class CargoTrackingEvent(Base):
    __tablename__ = "cargo_tracking_events"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    cargo_id = Column(String(36), ForeignKey("cargo.id"), nullable=False)
    status = Column(String(50), nullable=False)
    location = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    recorded_by = Column(String(100), default="Logistics Officer")
    notes = Column(Text, nullable=True)

    cargo = relationship("Cargo", back_populates="tracking_events")

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    item_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False) # Polar Fuel, Survival Food, Generator Spares, Medical, Scientific Consumables, Extreme Cold Gear
    station_id = Column(String(36), ForeignKey("stations.id"), nullable=False)
    quantity = Column(Float, default=100.0)
    reserved_quantity = Column(Float, default=0.0)
    unit = Column(String(20), default="Liters")
    minimum_stock = Column(Float, default=50.0)
    reorder_threshold = Column(Float, default=70.0)
    burn_rate_per_day = Column(Float, default=1.0)
    expiry_date = Column(DateTime, nullable=True)
    batch_number = Column(String(50), nullable=True)
    supplier = Column(String(100), default="IOCL / Defence Supply")
    unit_cost = Column(Float, default=0.0)
    storage_location = Column(String(100), default="Main Depot Bay 1")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    station = relationship("Station", back_populates="inventory_items")
    transactions = relationship("InventoryTransaction", back_populates="inventory_item")

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    inventory_item_id = Column(String(36), ForeignKey("inventory_items.id"), nullable=False)
    transaction_type = Column(String(50), nullable=False) # Stock In, Stock Out, Stock Transfer, Stock Adjustment, Stock Reservation, Stock Release
    quantity = Column(Float, nullable=False)
    source_location = Column(String(100), nullable=True)
    destination_location = Column(String(100), nullable=True)
    expedition_id = Column(String(36), ForeignKey("expeditions.id"), nullable=True)
    cargo_id = Column(String(36), ForeignKey("cargo.id"), nullable=True)
    performed_by = Column(String(100), default="Station Logistics Officer")
    timestamp = Column(DateTime, default=datetime.utcnow)
    reason = Column(Text, nullable=True)

    inventory_item = relationship("InventoryItem", back_populates="transactions")

class EmergencyIncident(Base):
    __tablename__ = "emergency_incidents"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    incident_code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(150), nullable=False)
    incident_type = Column(String(50), nullable=False) # Medical Emergency, Severe Weather, Equipment Failure, Transport Accident, Communication Failure, Fire, Fuel Leak, Missing Personnel, Search and Rescue, Other
    description = Column(Text, nullable=False)
    severity = Column(String(50), default="High") # Low, Medium, High, Critical
    status = Column(String(50), default="Reported") # Reported, Acknowledged, Assessing, Response Assigned, In Progress, Escalated, Resolved, Closed
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    station_id = Column(String(36), ForeignKey("stations.id"), nullable=True)
    expedition_id = Column(String(36), ForeignKey("expeditions.id"), nullable=True)
    reported_by = Column(String(100), default="Station Commander")
    reported_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)

    assignments = relationship("IncidentAssignment", back_populates="incident")
    updates = relationship("IncidentUpdate", back_populates="incident")

class IncidentAssignment(Base):
    __tablename__ = "incident_assignments"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    incident_id = Column(String(36), ForeignKey("emergency_incidents.id"), nullable=False)
    asset_id = Column(String(36), ForeignKey("assets.id"), nullable=True)
    personnel_id = Column(String(36), ForeignKey("personnel.id"), nullable=True)
    assignment_type = Column(String(50), default="Primary SAR Unit")
    assigned_at = Column(DateTime, default=datetime.utcnow)
    released_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="Assigned")

    incident = relationship("EmergencyIncident", back_populates="assignments")

class IncidentUpdate(Base):
    __tablename__ = "incident_updates"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    incident_id = Column(String(36), ForeignKey("emergency_incidents.id"), nullable=False)
    status = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    created_by = Column(String(100), default="Incident Commander")
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("EmergencyIncident", back_populates="updates")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="SYSTEM") # Low inventory, Critical inventory, Cargo delayed, Cargo delivered, Maintenance due, Emergency incident, Personnel check-in
    severity = Column(String(50), default="info") # info, warning, danger, success
    is_read = Column(Boolean, default=False)
    link = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True)
    user_email = Column(String(100), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(50), nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
