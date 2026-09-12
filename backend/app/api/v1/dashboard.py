from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.db.session import get_db
from backend.app.db.models import (
    Expedition, Cargo, InventoryItem, EmergencyIncident, Asset, Personnel, Station, AuditLog
)
from backend.app.core.deps import get_current_user

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
) -> Dict[str, Any]:
    active_expeditions = db.query(Expedition).filter(Expedition.status.in_(["Active", "Preparing"])).count()
    cargo_in_transit = db.query(Cargo).filter(Cargo.status.in_(["Dispatched", "In Transit", "At Port"])).count()
    critical_inventory_alerts = db.query(InventoryItem).filter(InventoryItem.quantity <= InventoryItem.minimum_stock).count()
    active_emergencies = db.query(EmergencyIncident).filter(EmergencyIncident.status != "Resolved").count()
    operational_assets = db.query(Asset).filter(Asset.status.in_(["Available", "Operational", "Assigned"])).count()
    personnel_deployed = db.query(Personnel).filter(Personnel.current_status.in_(["On Station", "Field Sortie", "In Transit"])).count()
    
    # Stations summary
    stations = db.query(Station).all()
    
    return {
        "kpis": {
            "active_expeditions": active_expeditions,
            "cargo_in_transit": cargo_in_transit,
            "critical_inventory_alerts": critical_inventory_alerts,
            "active_emergencies": active_emergencies,
            "operational_assets": operational_assets,
            "personnel_deployed": personnel_deployed,
        },
        "cargo_stats": {
            "packed": db.query(Cargo).filter(Cargo.status == "Packed").count(),
            "in_transit": cargo_in_transit,
            "delivered": db.query(Cargo).filter(Cargo.status == "Delivered").count(),
            "delayed": db.query(Cargo).filter(Cargo.status == "Delayed").count(),
        },
        "station_weather": [
            {
                "id": s.id,
                "name": s.name,
                "code": s.code,
                "region": s.region,
                "temperature_c": s.temperature_c,
                "wind_speed_kmh": s.wind_speed_kmh,
                "blizzard_level": s.blizzard_level,
                "active_personnel": s.active_personnel,
                "capacity": s.capacity,
                "latitude": s.latitude,
                "longitude": s.longitude
            }
            for s in stations
        ]
    }

@router.get("/activity")
def get_recent_activity(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(15).all()
    return [
        {
            "id": log.id,
            "user_email": log.user_email,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "created_at": log.created_at
        }
        for log in logs
    ]

@router.get("/alerts")
def get_dashboard_alerts(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
) -> Dict[str, Any]:
    low_stock = db.query(InventoryItem).filter(InventoryItem.quantity <= InventoryItem.minimum_stock).all()
    emergencies = db.query(EmergencyIncident).filter(EmergencyIncident.status != "Resolved").all()
    cold_chain_alerts = db.query(Cargo).filter(Cargo.is_cold_chain == True, Cargo.is_temp_violated == True).all()
    
    return {
        "low_stock_items": [
            {
                "id": item.id,
                "name": item.name,
                "item_code": item.item_code,
                "station_id": item.station_id,
                "current_stock": item.quantity,
                "minimum_stock": item.minimum_stock,
                "unit": item.unit
            }
            for item in low_stock
        ],
        "active_emergencies": [
            {
                "id": e.id,
                "incident_code": e.incident_code,
                "title": e.title,
                "severity": e.severity,
                "status": e.status,
                "reported_at": e.reported_at
            }
            for e in emergencies
        ],
        "cold_chain_violations": [
            {
                "id": c.id,
                "cargo_code": c.cargo_code,
                "name": c.name,
                "current_temp_c": c.current_temp_c,
                "temp_min_c": c.temp_min_c,
                "temp_max_c": c.temp_max_c
            }
            for c in cold_chain_alerts
        ]
    }
