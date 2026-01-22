from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.application import Application
from app.schemas.application import ApplicationOut, ApplicationCreate, ApplicationUpdate


router = APIRouter(prefix="/applications", tags=["applications"])

@router.post("", response_model=ApplicationOut)
def create_application(payload: ApplicationCreate, db: Session = Depends(get_db)):
    new_app = Application(company=payload.company, position=payload.position)
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app


@router.get("", response_model=list[ApplicationOut])
def list_applications(
    db: Session = Depends(get_db),
    company: Optional[str] = None,
    position: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge =1 , le =100),):
    
    qyery = db.query(Application)
    
    if company:
        qyery = qyery.filter(Application.company.ilike(f"%{company}%"))
        
    if position:
        qyery = qyery.filter(Application.position.ilike(f"%{position}%"))
    
    return qyery.offset(skip).limit(limit).all()    

@router.get("/{application_id}", response_model=ApplicationOut)
def get_application(application_id: int, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.put("/{application_id}", response_model=ApplicationOut)
def update_application(application_id: int, payload: ApplicationUpdate, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if app is None:
        raise HTTPException(status_code=404, detail="Application not found")

    app.company = payload.company
    app.position = payload.position

    db.commit()
    db.refresh(app)
    return app
                
                
@router.delete("/{application_id}", status_code=204)
def delete_application(application_id: int, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if app is None:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(app)
    db.commit()
    return