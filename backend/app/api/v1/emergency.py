from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.app.db.session import get_db
from backend.app.db.models import (
    EmergencyIncident, IncidentAssignment, IncidentUpdate, Notification, AuditLog, Asset, Personnel
)
from backend.app.schemas.schemas import (
    EmergencyIncidentCreate, EmergencyIncidentUpdate, EmergencyIncidentResponse,
    IncidentAssignmentCreate, IncidentAssignmentResponse,
    IncidentUpdateCreate, IncidentUpdateResponse
)
from backend.app.core.deps import get_current_user, RequireRole

router = APIRouter()

@router.get("/incidents", response_model=List[EmergencyIncidentResponse])
def get_incidents(
    severity: Optional[str] = None,
    status_filter: Optional[str] = None,
    station_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(EmergencyIncident)
    if severity:
        query = query.filter(EmergencyIncident.severity == severity)
    if status_filter:
        query = query.filter(EmergencyIncident.status == status_filter)
    if station_id:
        query = query.filter(EmergencyIncident.station_id == station_id)
    return query.order_by(EmergencyIncident.reported_at.desc()).all()

@router.post("/incidents", response_model=EmergencyIncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    payload: EmergencyIncidentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    incident = EmergencyIncident(
        **payload.dict(),
        reported_by=current_user.name
    )
    db.add(incident)
    db.flush()
    
    # Initial status update log
    update_log = IncidentUpdate(
        incident_id=incident.id,
        status=incident.status,
        message=f"Emergency incident logged: {incident.title}. Situation: {incident.description}",
        created_by=current_user.name
    )
    db.add(update_log)
    
    # Send system broadcast notification
    db.add(Notification(
        title=f"🚨 EMERGENCY: {incident.incident_code} - {incident.title}",
        message=f"Severity: {incident.severity}. {incident.description}",
        notification_type="Emergency incident",
        severity="danger" if incident.severity in ["High", "Critical"] else "warning",
        link=f"/emergency"
    ))
    
    db.add(AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="CREATE_INCIDENT",
        entity_type="EmergencyIncident",
        entity_id=incident.id,
        metadata_json=f"Reported emergency incident {incident.incident_code} ({incident.severity})"
    ))
    
    db.commit()
    db.refresh(incident)
    return incident

@router.get("/incidents/{id}", response_model=EmergencyIncidentResponse)
def get_incident_by_id(
    id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    incident = db.query(EmergencyIncident).filter(EmergencyIncident.id == id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.patch("/incidents/{id}", response_model=EmergencyIncidentResponse)
def update_incident(
    id: str,
    payload: EmergencyIncidentUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    incident = db.query(EmergencyIncident).filter(EmergencyIncident.id == id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    prev_status = incident.status
    update_data = payload.dict(exclude_unset=True)
    
    for field, val in update_data.items():
        setattr(incident, field, val)
        
    if payload.status == "Resolved" and not incident.resolved_at:
        incident.resolved_at = datetime.utcnow()
        
    if payload.status and payload.status != prev_status:
        db.add(IncidentUpdate(
            incident_id=incident.id,
            status=incident.status,
            message=f"Incident status changed from {prev_status} to {incident.status}. {payload.resolution_notes or ''}",
            created_by=current_user.name
        ))
        
    db.commit()
    db.refresh(incident)
    return incident

@router.post("/incidents/{id}/assignments", response_model=IncidentAssignmentResponse)
def assign_incident_resource(
    id: str,
    payload: IncidentAssignmentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    incident = db.query(EmergencyIncident).filter(EmergencyIncident.id == id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    assignment = IncidentAssignment(
        incident_id=incident.id,
        asset_id=payload.asset_id,
        personnel_id=payload.personnel_id,
        assignment_type=payload.assignment_type
    )
    
    incident.status = "Response Assigned"
    
    resource_desc = "SAR Unit"
    if payload.asset_id:
        asset = db.query(Asset).filter(Asset.id == payload.asset_id).first()
        if asset:
            asset.status = "Assigned"
            resource_desc = f"Asset {asset.name}"
    if payload.personnel_id:
        pers = db.query(Personnel).filter(Personnel.id == payload.personnel_id).first()
        if pers:
            pers.current_status = "Field Sortie"
            resource_desc += f", Responder {pers.name}"
            
    db.add(IncidentUpdate(
        incident_id=incident.id,
        status="Response Assigned",
        message=f"SAR Resource Dispatched: {resource_desc} assigned for emergency rescue.",
        created_by=current_user.name
    ))
    
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

@router.post("/incidents/{id}/updates", response_model=IncidentUpdateResponse)
def add_incident_update_log(
    id: str,
    payload: IncidentUpdateCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    incident = db.query(EmergencyIncident).filter(EmergencyIncident.id == id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    incident.status = payload.status
    update_entry = IncidentUpdate(
        incident_id=incident.id,
        status=payload.status,
        message=payload.message,
        created_by=payload.created_by or current_user.name
    )
    db.add(update_entry)
    db.commit()
    db.refresh(update_entry)
    return update_entry
