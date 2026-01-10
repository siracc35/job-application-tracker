from fastapi import FastAPI
from app.routers.applications import router as applications_router

from app.database import Base,engine
from app.models.application import Application

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(applications_router)

@app.get("/health")
def health():
    return{"status": "ok"}