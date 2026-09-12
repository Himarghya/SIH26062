from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.db.session import get_db
from backend.app.db.models import Station, Notification, AuditLog
from backend.app.schemas.schemas import StationCreate, StationResponse
from backend.app.core.deps import get_current_user, RequireRole

router = APIRouter()

@router.get("", response_model=List[StationResponse])
def get_stations(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(Station).all()

@router.get("/{id}", response_model=StationResponse)
def get_station_by_id(
    id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    station = db.query(Station).filter(Station.id == id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    return station

@router.post("/{id}/blizzard-level")
def set_station_blizzard_level(
    id: str,
    level: str, # NORMAL, STAGE_1_ADVISORY, STAGE_2_WARNING, STAGE_3_WHITEOUT_LOCKDOWN
    db: Session = Depends(get_db),
    current_user = Depends(RequireRole(["super_admin", "station_manager", "emergency_coordinator"]))
):
    station = db.query(Station).filter(Station.id == id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
        
    station.blizzard_level = level
    if level == "STAGE_3_WHITEOUT_LOCKDOWN":
        station.status = "High Alert"
        db.add(Notification(
            title=f"🚨 Stage-3 Blizzard Whiteout at {station.name}",
            message="Total airtight lockdown enforced. Outdoor traverses suspended. Automated muster initiated.",
            notification_type="Emergency incident",
            severity="danger",
            link="/emergency"
        ))
    elif level == "NORMAL":
        station.status = "Operational"
        
    db.add(AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="UPDATE_BLIZZARD_LEVEL",
        entity_type="Station",
        entity_id=station.id,
        metadata_json=f"Set blizzard level to {level} at {station.name}"
    ))
    db.commit()
    return {"message": "Blizzard level updated", "station": station.name, "level": level}
