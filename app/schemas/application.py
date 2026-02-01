from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from datetime import date , datetime

Status = Literal[
    "APPLIED",
    "HR_INTERVIEW",
    "TECH_INTERVIEW",
    "CASE_STUDY",
    "OFFER",
    "REJECTED",
    "WITHDRAWN",
]

JobType = Optional[Literal["remote", "hybrid", "onsite"]]

class ApplicationCreate(BaseModel):
    company_name: str
    position_title: str
    location: Optional[str] = None
    job_type: JobType = None
    source: Optional[str] = None
    applied_date: Optional[date] = None
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    company_name: Optional[str] = None
    position_title: Optional[str] = None
    location: Optional[str] = None
    job_type: JobType = None
    source: Optional[str] = None
    applied_date: Optional[date] = None
    notes: Optional[str] = None


class StatusUpdate(BaseModel):
    status: Status
    note: Optional[str] = None


class ApplicationOut(BaseModel):
    id: int
    company_name: str
    position_title: str
    location: Optional[str]
    job_type: Optional[str]
    source: Optional[str]
    applied_date: Optional[date]
    current_status: str
    notes: Optional[str]
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # pydantic v2


class HistoryOut(BaseModel):
    status: str
    changed_at: datetime
    note: Optional[str]

    class Config:
        from_attributes = True