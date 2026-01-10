from pydantic import BaseModel, ConfigDict

class ApplicationOut(BaseModel):
    id: int
    company: str
    position: str
    
class ApplicationCreate(BaseModel):
    company: str
    position: str
    
class ApplicationUpdate(BaseModel):
    company: str
    position: str
    
    model_config = ConfigDict(from_attributes=True)