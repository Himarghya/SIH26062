from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, model_validator

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    name: str
    email: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Station Schemas
class StationBase(BaseModel):
    name: str
    code: str
    country: str = "India"
    organization: str = "NCPOR / MoES"
    region: str = "Antarctica"
    location_name: Optional[str] = None
    latitude: float
    longitude: float
    elevation_m: float = 0.0
    capacity: int = 40
    active_personnel: int = 0
    status: str = "Operational"
    temperature_c: float = -25.0
    wind_speed_kmh: float = 30.0
    blizzard_level: str = "NORMAL"

class StationCreate(StationBase):
    pass

class StationResponse(StationBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Expedition Schemas
class ExpeditionBase(BaseModel):
    expedition_code: str
    name: str
    description: Optional[str] = None
    region: str = "Antarctica"
    destination: str
    mission_type: str = "Scientific Research"
    start_date: datetime
    end_date: datetime
    status: str = "Active"
    priority: str = "High"
    budget_crores: float = 50.0
    cargo_quota_tons: float = 2000.0
    risk_index: int = 5

class ExpeditionCreate(ExpeditionBase):
    pass

class ExpeditionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    destination: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    budget_crores: Optional[float] = None
    cargo_quota_tons: Optional[float] = None
    risk_index: Optional[int] = None

class ExpeditionResponse(ExpeditionBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Personnel Schemas
class PersonnelBase(BaseModel):
    personnel_code: str
    name: str
    role: str
    organization: str = "NCPOR"
    contact_information: Optional[str] = None
    blood_group: str = "O+ve"
    fitness_status: str = "Class-1 Polar Cleared"
    survival_trained: bool = True
    current_status: str = "On Station"
    assigned_expedition_id: Optional[str] = None
    assigned_station_id: Optional[str] = None
    assigned_shelter: str = "Main Habitation Sector A"
    radio_id: str = "TAC-1"
    availability: str = "Deployed"
    biometric_muster_passed: bool = True

    @model_validator(mode="before")
    @classmethod
    def map_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Map frontend form variations to canonical fields
            if "badge_number" in data and "personnel_code" not in data:
                data["personnel_code"] = data["badge_number"]
            elif "badge" in data and "personnel_code" not in data:
                data["personnel_code"] = data["badge"]
            if "full_name" in data and "name" not in data:
                data["name"] = data["full_name"]
            if "station_id" in data and "assigned_station_id" not in data:
                data["assigned_station_id"] = data["station_id"]
            if "expedition_id" in data and "assigned_expedition_id" not in data:
                data["assigned_expedition_id"] = data["expedition_id"]
            if "medical_clearance" in data and "fitness_status" not in data:
                data["fitness_status"] = data["medical_clearance"]
            if "status" in data and "current_status" not in data:
                data["current_status"] = data["status"]
            if "tactical_callsign" in data and "radio_id" not in data:
                data["radio_id"] = data["tactical_callsign"]
            if "shelter" in data and "assigned_shelter" not in data:
                data["assigned_shelter"] = data["shelter"]
        return data

class PersonnelCreate(PersonnelBase):
    pass

class PersonnelResponse(PersonnelBase):
    id: str
    last_muster_timestamp: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class PersonnelMovementCreate(BaseModel):
    from_location: str
    to_location: str
    movement_type: str
    expedition_id: Optional[str] = None
    recorded_by: Optional[str] = "Station Officer"
    notes: Optional[str] = None

class PersonnelMovementResponse(BaseModel):
    id: str
    personnel_id: str
    from_location: str
    to_location: str
    movement_type: str
    timestamp: datetime
    recorded_by: str
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True

# Asset Schemas
class AssetBase(BaseModel):
    asset_code: str
    name: str
    asset_type: str
    owner_organization: str = "NCPOR / MoES"
    status: str = "Available"
    current_location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    assigned_expedition_id: Optional[str] = None
    capacity_tons: float = 0.0
    fuel_pct: float = 100.0

class AssetCreate(AssetBase):
    pass

class AssetResponse(AssetBase):
    id: str
    last_inspection: datetime
    next_maintenance: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class AssetMaintenanceCreate(BaseModel):
    maintenance_type: str
    description: Optional[str] = None
    performed_by: str
    cost: float = 0.0
    result: str = "Passed"
    next_due_date: Optional[datetime] = None

class AssetMaintenanceResponse(BaseModel):
    id: str
    asset_id: str
    maintenance_type: str
    description: Optional[str] = None
    performed_by: str
    date: datetime
    cost: float
    result: str
    next_due_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Cargo Schemas
class CargoBase(BaseModel):
    cargo_code: str
    barcode: str
    name: str
    category: str
    description: Optional[str] = None
    quantity: float = 1.0
    unit: str = "Units"
    weight_kg: float = 100.0
    volume_m3: float = 1.0
    origin: str = "Goa Port Complex"
    destination_station_id: Optional[str] = None
    expedition_id: Optional[str] = None
    assigned_asset_id: Optional[str] = None
    status: str = "Packed"
    priority: str = "High"
    is_cold_chain: bool = False
    temp_min_c: Optional[float] = -85.0
    temp_max_c: Optional[float] = -75.0
    current_temp_c: Optional[float] = -80.0
    hazard_type: str = "None"
    expected_delivery_date: Optional[datetime] = None
    current_location: str = "Goa Port Staging Depot"
    special_handling_instructions: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def map_cargo_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "destination" in data and "destination_station_id" not in data:
                data["destination_station_id"] = data["destination"]
            if "tracking_code" in data and "cargo_code" not in data:
                data["cargo_code"] = data["tracking_code"]
        return data

class CargoCreate(CargoBase):
    pass

class CargoUpdate(BaseModel):
    status: Optional[str] = None
    current_location: Optional[str] = None
    assigned_asset_id: Optional[str] = None
    current_temp_c: Optional[float] = None
    priority: Optional[str] = None

class CargoTrackingEventCreate(BaseModel):
    status: str
    location: str
    recorded_by: Optional[str] = "Logistics Officer"
    notes: Optional[str] = None

class CargoTrackingEventResponse(BaseModel):
    id: str
    cargo_id: str
    status: str
    location: str
    timestamp: datetime
    recorded_by: str
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True

class CargoResponse(CargoBase):
    id: str
    is_temp_violated: bool
    created_at: datetime
    updated_at: datetime
    tracking_events: List[CargoTrackingEventResponse] = []
    
    class Config:
        from_attributes = True

# Inventory Schemas
class InventoryItemBase(BaseModel):
    item_code: str
    name: str
    category: str
    station_id: str
    quantity: float
    reserved_quantity: float = 0.0
    unit: str = "Liters"
    minimum_stock: float = 50.0
    reorder_threshold: float = 70.0
    burn_rate_per_day: float = 1.0
    expiry_date: Optional[datetime] = None
    batch_number: Optional[str] = None
    supplier: str = "IOCL / Defence Supply"
    unit_cost: float = 0.0
    storage_location: str = "Main Depot Bay 1"

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemResponse(InventoryItemBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class InventoryTransactionCreate(BaseModel):
    transaction_type: str # Stock In, Stock Out, Stock Transfer, Stock Adjustment, Stock Reservation, Stock Release
    quantity: float
    source_location: Optional[str] = None
    destination_location: Optional[str] = None
    expedition_id: Optional[str] = None
    cargo_id: Optional[str] = None
    performed_by: Optional[str] = "Station Logistics Officer"
    reason: Optional[str] = None

class InventoryTransactionResponse(BaseModel):
    id: str
    inventory_item_id: str
    transaction_type: str
    quantity: float
    source_location: Optional[str] = None
    destination_location: Optional[str] = None
    performed_by: str
    timestamp: datetime
    reason: Optional[str] = None
    
    class Config:
        from_attributes = True

# Emergency Incident Schemas
class EmergencyIncidentBase(BaseModel):
    incident_code: str
    title: str
    incident_type: str
    description: str
    severity: str = "High"
    status: str = "Reported"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    station_id: Optional[str] = None
    expedition_id: Optional[str] = None
    reported_by: str = "Station Commander"

class EmergencyIncidentCreate(EmergencyIncidentBase):
    pass

class EmergencyIncidentUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    resolution_notes: Optional[str] = None

class IncidentAssignmentCreate(BaseModel):
    asset_id: Optional[str] = None
    personnel_id: Optional[str] = None
    assignment_type: str = "Primary SAR Team"

class IncidentAssignmentResponse(BaseModel):
    id: str
    incident_id: str
    asset_id: Optional[str] = None
    personnel_id: Optional[str] = None
    assignment_type: str
    assigned_at: datetime
    status: str
    
    class Config:
        from_attributes = True

class IncidentUpdateCreate(BaseModel):
    status: Optional[str] = "Update Logged"
    message: str
    created_by: Optional[str] = "Incident Commander"

    @model_validator(mode="before")
    @classmethod
    def map_incident_update_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "update_text" in data and "message" not in data:
                data["message"] = data["update_text"]
            elif "note" in data and "message" not in data:
                data["message"] = data["note"]
            elif "text" in data and "message" not in data:
                data["message"] = data["text"]
            if "reported_by" in data and "created_by" not in data:
                data["created_by"] = data["reported_by"]
            if "status" not in data or not data["status"]:
                data["status"] = "Update Logged"
        return data

class IncidentUpdateResponse(BaseModel):
    id: str
    incident_id: str
    status: str
    message: str
    created_by: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class EmergencyIncidentResponse(EmergencyIncidentBase):
    id: str
    reported_at: datetime
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    assignments: List[IncidentAssignmentResponse] = []
    updates: List[IncidentUpdateResponse] = []
    
    class Config:
        from_attributes = True

# Notification Schemas
class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    notification_type: str
    severity: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
