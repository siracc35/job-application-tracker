from sqlalchemy import Column, Integer, String
from app.database import Base

class Application(Base):
    __tablename__ = 'applications'

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String(255), nullable=False)
    position = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="APPLIED")