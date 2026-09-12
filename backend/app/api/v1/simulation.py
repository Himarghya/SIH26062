from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from backend.app.db.session import get_db
from backend.app.db.models import (
    Cargo, CargoTrackingEvent, InventoryItem, InventoryTransaction,
    EmergencyIncident, IncidentAssignment, IncidentUpdate, Asset, Personnel, Notification, AuditLog
)
from backend.app.core.deps import get_current_user

router = APIRouter()

@router.post("/step/{step_id}")
def execute_simulation_step(
    step_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Deterministic Digital Twin Simulation Controller for Demonstrations:
    Step 1: Dispatch Cargo from Goa Logistics Hub to ORV Sagar Kanya
    Step 2: Airlift Cargo via Helicopter VT-NCP1 & Deliver to Bharati Station -> Update Inventory
    Step 3: Trigger Stage-3 Blizzard SAR Emergency & Assign Rescue Asset
    Step 4: Resolve Emergency Incident & Log Safe Return
    """
    if step_id == 1:
        cargo = db.query(Cargo).filter(Cargo.status == "Packed").first()
        if not cargo:
            cargo = db.query(Cargo).first()
        if cargo:
            cargo.status = "In Transit"
            cargo.current_location = "Vessel Hold - MV Vasiliy Golovnin (Southern Ocean)"
            cargo.updated_at = datetime.utcnow()
            db.add(CargoTrackingEvent(
                cargo_id=cargo.id,
                status="In Transit",
                location="Southern Ocean 55°S Transect",
                recorded_by="Simulation Engine",
                notes="[SIMULATION] Cargo loaded onto icebreaker and dispatched southwards."
            ))
            db.add(Notification(
                title=f"🚢 Cargo Dispatched: {cargo.cargo_code}",
                message=f"{cargo.name} is now in transit via MV Vasiliy Golovnin.",
                notification_type="Cargo dispatched",
                severity="info",
                link="/cargo"
            ))
            db.commit()
            return {
                "step": 1,
                "title": "Cargo Dispatched on Polar Vessel",
                "message": f"Dispatched cargo {cargo.cargo_code} into vessel hold. Vessel en route to Antarctica."
            }

    elif step_id == 2:
        cargo = db.query(Cargo).filter(Cargo.status == "In Transit").first()
        if not cargo:
            cargo = db.query(Cargo).first()
        if cargo:
            cargo.status = "Delivered"
            cargo.current_location = "Bharati Station Cryo Vault"
            cargo.updated_at = datetime.utcnow()
            db.add(CargoTrackingEvent(
                cargo_id=cargo.id,
                status="Delivered",
                location="Bharati Station Base Vault",
                recorded_by="Simulation Engine",
                notes="[SIMULATION] Airlifted by Kamov Ka-32 helo and received at base."
            ))
            # Restock inventory
            inv = db.query(InventoryItem).filter(InventoryItem.category.ilike("%Fuel%")).first()
            if inv:
                inv.quantity += 5000.0
                db.add(InventoryTransaction(
                    inventory_item_id=inv.id,
                    transaction_type="Stock In",
                    quantity=5000.0,
                    source_location="Vessel Hold",
                    destination_location=inv.storage_location,
                    performed_by="Simulation Engine",
                    reason="[SIMULATION] Fuel delivery from polar vessel"
                ))
            db.add(Notification(
                title="✅ Cargo Delivered & Restocked",
                message=f"Received {cargo.cargo_code} at Bharati Station. Stock level replenished.",
                notification_type="Cargo delivered",
                severity="success",
                link="/inventory"
            ))
            db.commit()
            return {
                "step": 2,
                "title": "Airlift & Station Delivery Complete",
                "message": f"Delivered {cargo.cargo_code} to station. Station inventory successfully increased."
            }

    elif step_id == 3:
        emergency = EmergencyIncident(
            incident_code=f"SOS-{datetime.utcnow().strftime('%H%M%S')}",
            title="[SIMULATION] Severe Katabatic Whiteout & Glacial Sortie Recall",
            incident_type="Search and Rescue",
            description="Katabatic winds exceeding 90 km/h at Dalk Glacier. Field team requires GPS-guided tracking back to base.",
            severity="Critical",
            status="In Progress",
            reported_by="Simulation Controller",
            reported_at=datetime.utcnow()
        )
        db.add(emergency)
        db.flush()
        
        # Assign response asset
        snowcat = db.query(Asset).filter(Asset.asset_type.ilike("%Snow%")).first()
        if snowcat:
            snowcat.status = "Assigned"
            db.add(IncidentAssignment(
                incident_id=emergency.id,
                asset_id=snowcat.id,
                assignment_type="Heavy Rescue Vehicle",
                status="Dispatched"
            ))
        db.add(Notification(
            title="🚨 CRITICAL INCIDENT LOGGED",
            message="Whiteout sortie recall initiated. PistenBully SAR unit deployed.",
            notification_type="Emergency incident",
            severity="danger",
            link="/emergency"
        ))
        db.commit()
        return {
            "step": 3,
            "title": "Emergency SAR Scenario Triggered",
            "message": f"Incident {emergency.incident_code} raised. Rescue PistenBully deployed to field."
        }

    elif step_id == 4:
        emergency = db.query(EmergencyIncident).filter(EmergencyIncident.status != "Resolved").first()
        if emergency:
            emergency.status = "Resolved"
            emergency.resolved_at = datetime.utcnow()
            emergency.resolution_notes = "[SIMULATION] Field team safely escorted back to main base module. All personnel accounted for."
            db.add(IncidentUpdate(
                incident_id=emergency.id,
                status="Resolved",
                message="[SIMULATION] SAR operation concluded. 100% crew muster verified.",
                created_by="Simulation Controller"
            ))
            db.add(Notification(
                title="✅ Emergency Incident Resolved",
                message=f"Incident {emergency.incident_code} successfully resolved.",
                notification_type="Emergency incident",
                severity="success",
                link="/emergency"
            ))
            db.commit()
            return {
                "step": 4,
                "title": "Emergency Resolved Safely",
                "message": "SAR operation completed. 100% headcount muster verified."
            }

    return {"step": step_id, "message": "Simulation step acknowledged."}
