from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter()

# ✅ Create Unit
@router.post("/units", response_model=schemas.EmergencyUnit)
def create_unit(unit: schemas.EmergencyUnitCreate, db: Session = Depends(get_db)):
    db_unit = models.EmergencyUnit(**unit.dict())
    db.add(db_unit)
    db.commit()
    db.refresh(db_unit)
    return db_unit

# ✅ Get Units
@router.get("/units", response_model=List[schemas.EmergencyUnit])
def get_units(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    units = db.query(models.EmergencyUnit).offset(skip).limit(limit).all()
    return units

# ✅ Update Unit
@router.put("/units/{unit_id}", response_model=schemas.EmergencyUnit)
def update_unit(unit_id: str, unit_update: schemas.UnitUpdate, db: Session = Depends(get_db)):
    db_unit = db.query(models.EmergencyUnit).filter(models.EmergencyUnit.unit_id == unit_id).first()
    if not db_unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    for field, value in unit_update.dict(exclude_unset=True).items():
        setattr(db_unit, field, value)
    
    db.commit()
    db.refresh(db_unit)
    return db_unit
