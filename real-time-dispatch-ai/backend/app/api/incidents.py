from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..ml_models.priority_predictor import predict_priority

router = APIRouter()

@router.get("/incidents", response_model=List[schemas.Incident])
def get_incidents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    incidents = db.query(models.Incident).offset(skip).limit(limit).all()
    return incidents

@router.post("/incidents", response_model=schemas.Incident)
def create_incident(incident: schemas.IncidentCreate, db: Session = Depends(get_db)):
    # Use AI to predict priority
    priority = predict_priority(incident.type, incident.location, incident.description)
    
    payload = incident.dict()
    db_incident = models.Incident(
        **payload,
        priority=priority
    )
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident