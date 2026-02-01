import enum
from sqlalchemy import (
    Column, Integer, String, Date, Enum, Text, Boolean, TIMESTAMP, ForeignKey, func
)
from sqlalchemy.orm import relationship

from app.database import Base


class JobType(str, enum.Enum):
    remote = "remote"
    hybrid = "hybrid"
    onsite = "onsite"


class Status(str, enum.Enum):
    APPLIED = "APPLIED"
    HR_INTERVIEW = "HR_INTERVIEW"
    TECH_INTERVIEW = "TECH_INTERVIEW"
    CASE_STUDY = "CASE_STUDY"
    OFFER = "OFFER"
    REJECTED = "REJECTED"
    WITHDRAWN = "WITHDRAWN"


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)

    company_name = Column(String(255), nullable=False)
    position_title = Column(String(255), nullable=False)

    location = Column(String(255), nullable=True)
    job_type = Column(Enum(JobType), nullable=True)
    source = Column(String(100), nullable=True)
    applied_date = Column(Date, nullable=True)

    current_status = Column(Enum(Status), nullable=False, default=Status.APPLIED)
    notes = Column(Text, nullable=True)

    is_deleted = Column(Boolean, nullable=False, default=False)

    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    updated_at = Column(
        TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    history = relationship(
        "ApplicationStatusHistory",
        back_populates="application",
        cascade="all, delete-orphan",
    )


class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"

    id = Column(Integer, primary_key=True, index=True)

    application_id = Column(
        Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False
    )

    status = Column(Enum(Status), nullable=False)
    changed_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    note = Column(String(255), nullable=True)

    application = relationship("Application", back_populates="history")
