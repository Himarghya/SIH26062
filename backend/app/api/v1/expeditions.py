from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.app.db.session import get_db
from backend.app.db.models import Expedition, User, AuditLog
from backend.app.schemas.schemas import ExpeditionCreate, ExpeditionUpdate, ExpeditionResponse
from backend.app.core.deps import get_current_user, RequireRole

router = APIRouter()

@router.get("", response_model=List[ExpeditionResponse])
def get_expeditions(
    region: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Expedition)
    if region:
        query = query.filter(Expedition.region == region)
    if status_filter:
        query = query.filter(Expedition.status == status_filter)
    return query.order_by(Expedition.start_date.desc()).all()

@router.post("", response_model=ExpeditionResponse, status_code=status.HTTP_201_CREATED)
def create_expedition(
    payload: ExpeditionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RequireRole(["super_admin", "expedition_manager"]))
):
    existing = db.query(Expedition).filter(Expedition.expedition_code == payload.expedition_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Expedition with this code already exists")
    
    expedition = Expedition(**payload.dict(), manager_id=current_user.id)
    db.add(expedition)
    
    # Audit Log
    db.add(AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="CREATE_EXPEDITION",
        entity_type="Expedition",
        entity_id=expedition.id,
        metadata_json=f"Chartered expedition {expedition.expedition_code}: {expedition.name}"
    ))
    
    db.commit()
    db.refresh(expedition)
    return expedition

@router.get("/{id}", response_model=ExpeditionResponse)
def get_expedition_by_id(
    id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    expedition = db.query(Expedition).filter(Expedition.id == id).first()
    if not expedition:
        raise HTTPException(status_code=404, detail="Expedition not found")
    return expedition

@router.patch("/{id}", response_model=ExpeditionResponse)
def update_expedition(
    id: str,
    payload: ExpeditionUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(RequireRole(["super_admin", "expedition_manager"]))
):
    expedition = db.query(Expedition).filter(Expedition.id == id).first()
    if not expedition:
        raise HTTPException(status_code=404, detail="Expedition not found")
    
    update_data = payload.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(expedition, field, val)
        
    expedition.updated_at = datetime.utcnow()
    
    db.add(AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="UPDATE_EXPEDITION",
        entity_type="Expedition",
        entity_id=expedition.id,
        metadata_json=f"Updated expedition {expedition.expedition_code}"
    ))
    
    db.commit()
    db.refresh(expedition)
    return expedition

@router.delete("/{id}")
def delete_expedition(
    id: str,
    db: Session = Depends(get_db),
    current_user = Depends(RequireRole(["super_admin"]))
):
    expedition = db.query(Expedition).filter(Expedition.id == id).first()
    if not expedition:
        raise HTTPException(status_code=404, detail="Expedition not found")
    
    db.delete(expedition)
    db.commit()
    return {"message": f"Expedition {expedition.expedition_code} deleted successfully"}
