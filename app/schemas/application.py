from pydantic import BaseModel

class ApplicationOut(BaseModel):
    id: int
    company: str
    position: str
    
class ApplicationCreate(BaseModel):
    company: str
    position: str
    