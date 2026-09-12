from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from backend.app.db.session import get_db
from backend.app.db.models import InventoryItem, InventoryTransaction, AuditLog, Station
from backend.app.schemas.schemas import (
    InventoryItemCreate, InventoryItemResponse, InventoryTransactionCreate, InventoryTransactionResponse
)
from backend.app.core.deps import get_current_user, RequireRole

router = APIRouter()

@router.get("", response_model=List[InventoryItemResponse])
def get_inventory(
    station_id: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(InventoryItem)
    if station_id:
        query = query.filter(InventoryItem.station_id == station_id)
    if category:
        query = query.filter(InventoryItem.category == category)
    return query.order_by(InventoryItem.category, InventoryItem.name).all()

@router.post("", response_model=InventoryItemResponse, status_code=status.HTTP_201_CREATED)
def create_inventory_item(
    payload: InventoryItemCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RequireRole(["super_admin", "logistics_officer", "station_manager"]))
):
    existing = db.query(InventoryItem).filter(
        InventoryItem.item_code == payload.item_code,
        InventoryItem.station_id == payload.station_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Item SKU already exists for this station")
    
    item = InventoryItem(**payload.dict())
    db.add(item)
    db.flush()
    
    # Record initial stock transaction
    transaction = InventoryTransaction(
        inventory_item_id=item.id,
        transaction_type="Stock In",
        quantity=item.quantity,
        destination_location=item.storage_location,
        performed_by=current_user.name,
        reason="Initial inventory registration"
    )
    db.add(transaction)
    
    db.add(AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="CREATE_INVENTORY_ITEM",
        entity_type="InventoryItem",
        entity_id=item.id,
        metadata_json=f"Created inventory SKU {item.item_code}: {item.name} ({item.quantity} {item.unit})"
    ))
    
    db.commit()
    db.refresh(item)
    return item

@router.get("/alerts")
def get_inventory_alerts(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    items = db.query(InventoryItem).all()
    critical = []
    low = []
    
    for item in items:
        if item.quantity <= 0:
            critical.append({
                "item": item.name,
                "sku": item.item_code,
                "station": item.station.name if item.station else "Base",
                "status": "Out of Stock",
                "quantity": 0,
                "unit": item.unit
            })
        elif item.quantity <= item.minimum_stock:
            critical.append({
                "item": item.name,
                "sku": item.item_code,
                "station": item.station.name if item.station else "Base",
                "status": "Critical Stock",
                "quantity": item.quantity,
                "min": item.minimum_stock,
                "unit": item.unit
            })
        elif item.quantity <= item.reorder_threshold:
            low.append({
                "item": item.name,
                "sku": item.item_code,
                "station": item.station.name if item.station else "Base",
                "status": "Low Stock",
                "quantity": item.quantity,
                "reorder_threshold": item.reorder_threshold,
                "unit": item.unit
            })
            
    return {
        "critical_count": len(critical),
        "low_count": len(low),
        "critical_alerts": critical,
        "low_alerts": low
    }

@router.get("/forecast/{id}")
def get_inventory_forecast(
    id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
) -> Dict[str, Any]:
    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
        
    daily_burn = item.burn_rate_per_day if item.burn_rate_per_day > 0 else 1.0
    days_remaining = int(item.quantity / daily_burn) if item.quantity > 0 else 0
    suggested_reorder = max(0.0, (item.reorder_threshold * 2.5) - item.quantity)
    
    # 6-month projected depletion points
    projection = []
    for month_idx in range(6):
        days = month_idx * 30
        projected_stock = max(0.0, item.quantity - (days * daily_burn))
        projection.append({
            "month": f"M+{month_idx}",
            "projected_stock": round(projected_stock, 1),
            "safety_threshold": item.minimum_stock
        })
        
    return {
        "item_id": item.id,
        "item_name": item.name,
        "sku": item.item_code,
        "current_stock": item.quantity,
        "unit": item.unit,
        "estimated_daily_consumption": daily_burn,
        "estimated_days_until_stockout": days_remaining,
        "suggested_reorder_quantity": round(suggested_reorder, 1),
        "projection_curve": projection,
        "disclaimer": "Forecast estimate — requires operational validation by Station Logistics Officer."
    }

@router.get("/{id}", response_model=InventoryItemResponse)
def get_inventory_item_by_id(
    id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item

@router.post("/{id}/transactions", response_model=InventoryTransactionResponse)
def create_inventory_transaction(
    id: str,
    payload: InventoryTransactionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RequireRole(["super_admin", "logistics_officer", "station_manager"]))
):
    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
        
    # Process Ledger Transaction
    if payload.transaction_type in ["Stock In", "Stock Release"]:
        item.quantity += payload.quantity
    elif payload.transaction_type in ["Stock Out", "Stock Reservation"]:
        if item.quantity < payload.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock for transaction")
        item.quantity -= payload.quantity
    elif payload.transaction_type == "Stock Adjustment":
        item.quantity = payload.quantity
    elif payload.transaction_type == "Stock Transfer":
        if item.quantity < payload.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock for transfer")
        item.quantity -= payload.quantity
        
    item.updated_at = datetime.utcnow()
    
    transaction = InventoryTransaction(
        inventory_item_id=item.id,
        transaction_type=payload.transaction_type,
        quantity=payload.quantity,
        source_location=payload.source_location or item.storage_location,
        destination_location=payload.destination_location,
        expedition_id=payload.expedition_id,
        cargo_id=payload.cargo_id,
        performed_by=payload.performed_by or current_user.name,
        reason=payload.reason
    )
    db.add(transaction)
    
    db.add(AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="INVENTORY_TRANSACTION",
        entity_type="InventoryItem",
        entity_id=item.id,
        metadata_json=f"{payload.transaction_type}: {payload.quantity} {item.unit} for SKU {item.item_code}"
    ))
    
    db.commit()
    db.refresh(transaction)
    return transaction
