from fastapi import FastAPI
from app.routers.applications import router as applications_router
from app.routers.analytics import router as analytics_router
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base,engine
from app.models.application import Application

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Application Tracker API")
app.include_router(applications_router)
app.include_router(analytics_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return{"status": "ok"}