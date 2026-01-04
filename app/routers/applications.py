from fastapi import APIRouter 

router = APIRouter(prefix="/applications", tags=["applications"])

@router.get("")
def list_applications():
    return [
        {"company": "Google", "position": "Backend Intern"},
        {"company": "Amazon", "position": "Software Engineer Intern"}
    ]
