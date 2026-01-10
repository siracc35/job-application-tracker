from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

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
def list_applications(db: Session = Depends(get_db)):
    return db.query(Application).all()

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