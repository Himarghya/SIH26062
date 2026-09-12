from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.app.db.session import get_db
from backend.app.db.models import Cargo, CargoTrackingEvent, AuditLog, InventoryItem, InventoryTransaction
from backend.app.schemas.schemas import (
    CargoCreate, CargoUpdate, CargoResponse, CargoTrackingEventCreate, CargoTrackingEventResponse
)
from backend.app.core.deps import get_current_user, RequireRole

router = APIRouter()

@router.get("", response_model=List[CargoResponse])
def get_cargo_list(
    category: Optional[str] = None,
    status_filter: Optional[str] = None,
    is_cold_chain: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Cargo)
    if category:
        query = query.filter(Cargo.category == category)
    if status_filter:
        query = query.filter(Cargo.status == status_filter)
    if is_cold_chain is not None:
        query = query.filter(Cargo.is_cold_chain == is_cold_chain)
    return query.order_by(Cargo.created_at.desc()).all()

@router.post("", response_model=CargoResponse, status_code=status.HTTP_201_CREATED)
def create_cargo(
    payload: CargoCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RequireRole(["super_admin", "expedition_manager", "logistics_officer"]))
):
    existing = db.query(Cargo).filter(Cargo.cargo_code == payload.cargo_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cargo with this code already exists")
    
    cargo = Cargo(**payload.dict())
    
    # Check initial cold-chain bounds
    if cargo.is_cold_chain:
        cargo.is_temp_violated = (
            cargo.current_temp_c < cargo.temp_min_c or cargo.current_temp_c > cargo.temp_max_c
        )
        
    db.add(cargo)
    db.flush()
    
    # Initial tracking event
    tracking_event = CargoTrackingEvent(
        cargo_id=cargo.id,
        status=cargo.status,
        location=cargo.origin,
        recorded_by=current_user.name,
        notes="Cargo manifest registered and packaged for polar expedition."
    )
    db.add(tracking_event)
    
    db.add(AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="CREATE_CARGO",
        entity_type="Cargo",
        entity_id=cargo.id,
        metadata_json=f"Created cargo item {cargo.cargo_code}: {cargo.name}"
    ))
    
    db.commit()
    db.refresh(cargo)
    return cargo

@router.get("/barcode/{barcode}", response_model=CargoResponse)
def get_cargo_by_barcode(
    barcode: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    cargo = db.query(Cargo).filter(
        (Cargo.barcode == barcode) | (Cargo.cargo_code.ilike(barcode))
    ).first()
    if not cargo:
        raise HTTPException(status_code=404, detail="No cargo found matching barcode or tracking code")
    return cargo

@router.get("/{id}", response_model=CargoResponse)
def get_cargo_by_id(
    id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    cargo = db.query(Cargo).filter(Cargo.id == id).first()
    if not cargo:
        raise HTTPException(status_code=404, detail="Cargo not found")
    return cargo

@router.patch("/{id}", response_model=CargoResponse)
def update_cargo(
    id: str,
    payload: CargoUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(RequireRole(["super_admin", "logistics_officer", "station_manager"]))
):
    cargo = db.query(Cargo).filter(Cargo.id == id).first()
    if not cargo:
        raise HTTPException(status_code=404, detail="Cargo not found")
    
    prev_status = cargo.status
    update_data = payload.dict(exclude_unset=True)
    
    for field, val in update_data.items():
        setattr(cargo, field, val)
        
    if cargo.is_cold_chain and payload.current_temp_c is not None:
        cargo.is_temp_violated = (
            cargo.current_temp_c < cargo.temp_min_c or cargo.current_temp_c > cargo.temp_max_c
        )
        
    cargo.updated_at = datetime.utcnow()
    
    # If status changed, automatically log tracking event
    if payload.status and payload.status != prev_status:
        tracking_event = CargoTrackingEvent(
            cargo_id=cargo.id,
            status=cargo.status,
            location=cargo.current_location,
            recorded_by=current_user.name,
            notes=f"Cargo status updated from {prev_status} to {cargo.status}"
        )
        db.add(tracking_event)
        
        # If delivered to a station, automatically integrate with Station Inventory
        if cargo.status == "Delivered" and cargo.destination_station_id:
            inv_item = db.query(InventoryItem).filter(
                InventoryItem.station_id == cargo.destination_station_id,
                InventoryItem.name.ilike(cargo.name)
            ).first()
            if inv_item:
                inv_item.quantity += cargo.quantity
                db.add(InventoryTransaction(
                    inventory_item_id=inv_item.id,
                    transaction_type="Stock In",
                    quantity=cargo.quantity,
                    source_location=cargo.origin,
                    destination_location=inv_item.storage_location,
                    cargo_id=cargo.id,
                    performed_by=current_user.name,
                    reason=f"Automated stock-in from delivered cargo {cargo.cargo_code}"
                ))
    
    db.add(AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="UPDATE_CARGO",
        entity_type="Cargo",
        entity_id=cargo.id,
        metadata_json=f"Updated cargo {cargo.cargo_code} status: {cargo.status}"
    ))
    
    db.commit()
    db.refresh(cargo)
    return cargo

@router.post("/{id}/tracking-events", response_model=CargoTrackingEventResponse)
def add_tracking_event(
    id: str,
    payload: CargoTrackingEventCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RequireRole(["super_admin", "logistics_officer", "station_manager"]))
):
    cargo = db.query(Cargo).filter(Cargo.id == id).first()
    if not cargo:
        raise HTTPException(status_code=404, detail="Cargo not found")
        
    cargo.status = payload.status
    cargo.current_location = payload.location
    cargo.updated_at = datetime.utcnow()
    
    event = CargoTrackingEvent(
        cargo_id=cargo.id,
        status=payload.status,
        location=payload.location,
        recorded_by=payload.recorded_by or current_user.name,
        notes=payload.notes
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
