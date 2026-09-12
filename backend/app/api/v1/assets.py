from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.app.db.session import get_db
from backend.app.db.models import Asset, AssetMaintenance, AuditLog
from backend.app.schemas.schemas import (
    AssetCreate, AssetResponse, AssetMaintenanceCreate, AssetMaintenanceResponse
)
from backend.app.core.deps import get_current_user, RequireRole

router = APIRouter()

@router.get("", response_model=List[AssetResponse])
def get_assets(
    asset_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    expedition_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Asset)
    if asset_type:
        query = query.filter(Asset.asset_type == asset_type)
    if status_filter:
        query = query.filter(Asset.status == status_filter)
    if expedition_id:
        query = query.filter(Asset.assigned_expedition_id == expedition_id)
    return query.order_by(Asset.asset_type, Asset.name).all()

@router.post("", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
def create_asset(
    payload: AssetCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RequireRole(["super_admin", "logistics_officer"]))
):
    existing = db.query(Asset).filter(Asset.asset_code == payload.asset_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Asset code already registered")
        
    asset = Asset(**payload.dict())
    db.add(asset)
    db.add(AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="CREATE_ASSET",
        entity_type="Asset",
        entity_id=asset.id,
        metadata_json=f"Registered operational asset {asset.asset_code}: {asset.name} ({asset.asset_type})"
    ))
    db.commit()
    db.refresh(asset)
    return asset

@router.get("/{id}", response_model=AssetResponse)
def get_asset_by_id(
    id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    asset = db.query(Asset).filter(Asset.id == id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.post("/{id}/maintenance", response_model=AssetMaintenanceResponse)
def record_asset_maintenance(
    id: str,
    payload: AssetMaintenanceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RequireRole(["super_admin", "logistics_officer", "station_manager"]))
):
    asset = db.query(Asset).filter(Asset.id == id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    maintenance = AssetMaintenance(
        asset_id=asset.id,
        maintenance_type=payload.maintenance_type,
        description=payload.description,
        performed_by=payload.performed_by,
        cost=payload.cost,
        result=payload.result,
        next_due_date=payload.next_due_date
    )
    
    asset.last_inspection = datetime.utcnow()
    if payload.next_due_date:
        asset.next_maintenance = payload.next_due_date
    if payload.result == "Passed":
        asset.status = "Operational"
        
    asset.updated_at = datetime.utcnow()
    db.add(maintenance)
    db.commit()
    db.refresh(maintenance)
    return maintenance
