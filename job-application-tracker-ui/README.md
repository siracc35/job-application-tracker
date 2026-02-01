# Job Application Tracker

A full-stack job application tracker to manage applications, update statuses with history, and view analytics.

## Features
- ✅ Create / Edit / Soft Delete applications
- ✅ Status workflow with validation + status history timeline
- ✅ Filters (status, source) + pagination UI
- ✅ Dashboard analytics (summary + timeline chart)
- ✅ Toast notifications for UI feedback

## Tech Stack
**Backend:** FastAPI, SQLAlchemy, MySQL  
**Frontend:** React (Vite), React Router, Axios, Recharts

---

## Screens / Demo
> Add a short demo GIF here (recommended)

`/demo/demo.gif`

---

## Backend Setup (FastAPI)

### 1) Create `.env`
Create a `.env` file in the project root:

```env
DATABASE_URL=mysql+pymysql://<USER>:<PASSWORD>@<HOST>:<PORT>/job_application_tracker
