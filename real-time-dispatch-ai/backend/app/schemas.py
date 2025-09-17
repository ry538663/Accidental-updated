from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .models import PriorityLevel, UnitStatus

class IncidentBase(BaseModel):
    type: str
    location: str
    description: Optional[str] = None
    caller_name: Optional[str] = None
    caller_phone: Optional[str] = None
    # Emergency-specific
    patient_age: Optional[str] = None
    patient_gender: Optional[str] = None
    consciousness: Optional[str] = None
    bleeding: Optional[str] = None
    breathing: Optional[str] = None
    hazards_present: Optional[bool] = None
    gps_lat: Optional[str] = None
    gps_lng: Optional[str] = None

class IncidentCreate(IncidentBase):
    pass

class Incident(IncidentBase):
    id: int
    priority: str
    reported_at: datetime
    status: str

    class Config:
        orm_mode = True

class EmergencyUnitBase(BaseModel):
    unit_id: str
    unit_type: str
    current_location: Optional[str] = None

class EmergencyUnitCreate(EmergencyUnitBase):
    pass

class EmergencyUnit(EmergencyUnitBase):
    id: int
    status: str
    last_updated: datetime
    assigned_incident_id: Optional[int] = None

    class Config:
        orm_mode = True

class UnitUpdate(BaseModel):
    status: Optional[str] = None
    current_location: Optional[str] = None
    assigned_incident_id: Optional[int] = None