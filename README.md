# Job Application Tracker

A lightweight API to track job applications with status history, analytics, and soft delete.

## Features
- Create / List / Update applications
- Status updates with **history log**
- Soft delete (no hard delete)
- Simple analytics summary endpoint

## Tech Stack
- Python, FastAPI
- MySQL
- SQLAlchemy + Alembic

## Run
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
