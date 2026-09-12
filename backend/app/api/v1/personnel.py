from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.app.db.session import get_db
from backend.app.db.models import Personnel, PersonnelMovement, AuditLog
from backend.app.schemas.schemas import (
    PersonnelCreate, PersonnelResponse, PersonnelMovementCreate, PersonnelMovementResponse
)
from backend.app.core.deps import get_current_user, RequireRole

router = APIRouter()

@router.get("", response_model=List[PersonnelResponse])
def get_personnel_list(
    station_id: Optional[str] = None,
    expedition_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Personnel)
    if station_id:
        query = query.filter(Personnel.assigned_station_id == station_id)
    if expedition_id:
        query = query.filter(Personnel.assigned_expedition_id == expedition_id)
    if status_filter:
        query = query.filter(Personnel.current_status == status_filter)
    return query.order_by(Personnel.name).all()

@router.post("", response_model=PersonnelResponse, status_code=status.HTTP_201_CREATED)
def create_personnel(
    payload: PersonnelCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    existing = db.query(Personnel).filter(Personnel.personnel_code == payload.personnel_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Personnel code already registered")
        
    person = Personnel(**payload.dict())
    db.add(person)
    db.add(AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="CREATE_PERSONNEL",
        entity_type="Personnel",
        entity_id=person.id,
        metadata_json=f"Enrolled personnel {person.personnel_code}: {person.name} ({person.role})"
    ))
    db.commit()
    db.refresh(person)
    return person

@router.get("/{id}", response_model=PersonnelResponse)
def get_personnel_by_id(
    id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    person = db.query(Personnel).filter(Personnel.id == id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Personnel record not found")
    return person

@router.post("/{id}/muster")
def record_biometric_muster(
    id: str,
    passed: bool = True,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    person = db.query(Personnel).filter(Personnel.id == id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Personnel record not found")
        
    person.biometric_muster_passed = passed
    person.last_muster_timestamp = datetime.utcnow()
    person.updated_at = datetime.utcnow()
    
    db.add(AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="MUSTER_CHECKIN",
        entity_type="Personnel",
        entity_id=person.id,
        metadata_json=f"Muster verification: {person.name} status={passed}"
    ))
    db.commit()
    db.refresh(person)
    return {"message": "Muster roll updated", "person": person.name, "passed": passed}

@router.post("/{id}/movements", response_model=PersonnelMovementResponse)
def record_movement(
    id: str,
    payload: PersonnelMovementCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    person = db.query(Personnel).filter(Personnel.id == id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Personnel record not found")
        
    movement = PersonnelMovement(
        personnel_id=person.id,
        expedition_id=payload.expedition_id or person.assigned_expedition_id,
        from_location=payload.from_location,
        to_location=payload.to_location,
        movement_type=payload.movement_type,
        recorded_by=payload.recorded_by or current_user.name,
        notes=payload.notes
    )
    
    # Update current status
    if payload.movement_type in ["Departure", "Boarding"]:
        person.current_status = "In Transit"
    elif payload.movement_type in ["Arrival", "Disembarkation", "Check-in"]:
        person.current_status = "On Station"
    elif payload.movement_type == "Station Transfer":
        person.current_status = "On Station"
        
    person.updated_at = datetime.utcnow()
    db.add(movement)
    db.commit()
    db.refresh(movement)
    return movement
