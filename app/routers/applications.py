from fastapi import APIRouter 
from app.schemas.application import ApplicationOut, ApplicationCreate

applications_db = []
current_id = 1

router = APIRouter(prefix="/applications", tags=["applications"]) 

@router.get("", response_model=list[ApplicationOut])
def list_applications():
    return applications_db

@router.post("", response_model=ApplicationOut)
def create_application(payload: ApplicationCreate):
    global current_id
    new_application = {
        "id": current_id,
        "company": payload.company,
        "position": payload.position
    }
    applications_db.append(new_application)
    current_id += 1
    return new_application