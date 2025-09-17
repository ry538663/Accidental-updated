from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

Base = declarative_base()

class PriorityLevel(enum.Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

class UnitStatus(enum.Enum):
    AVAILABLE = 1
    EN_ROUTE = 2
    ON_SCENE = 3
    OFF_DUTY = 4

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)
    location = Column(String, nullable=False)
    priority = Column(Enum(PriorityLevel), default=PriorityLevel.MEDIUM)
    reported_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="Reported")  # Reported, Dispatched, Resolved
    description = Column(String)
    caller_name = Column(String)
    caller_phone = Column(String)
    # Emergency-specific fields
    patient_age = Column(String)
    patient_gender = Column(String)
    consciousness = Column(String)  # Conscious, Unconscious, Unknown
    bleeding = Column(String)       # None, Minor, Severe, Unknown
    breathing = Column(String)      # Normal, Difficulty, Not breathing, Unknown
    hazards_present = Column(Boolean, default=False)
    gps_lat = Column(String)
    gps_lng = Column(String)

class EmergencyUnit(Base):
    __tablename__ = "emergency_units"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(String, unique=True, nullable=False)
    unit_type = Column(String, nullable=False)  # ambulance, police, fire
    status = Column(Enum(UnitStatus), default=UnitStatus.AVAILABLE)
    current_location = Column(String)
    assigned_incident_id = Column(Integer, ForeignKey("incidents.id"))
    last_updated = Column(DateTime(timezone=True), server_default=func.now())