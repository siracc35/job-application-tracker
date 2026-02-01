from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.application import Application, ApplicationStatusHistory, Status
from app.schemas.application import (ApplicationOut,ApplicationCreate,ApplicationUpdate,StatusUpdate,HistoryOut,)

router = APIRouter(prefix="/applications", tags=["applications"])

# Status transition rules (string-based)
ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "APPLIED": {"HR_INTERVIEW", "REJECTED", "WITHDRAWN"},
    "HR_INTERVIEW": {"TECH_INTERVIEW", "REJECTED"},
    "TECH_INTERVIEW": {"CASE_STUDY", "OFFER", "REJECTED"},
    "CASE_STUDY": {"OFFER", "REJECTED"},
    "OFFER": {"WITHDRAWN"},
    "REJECTED": set(),
    "WITHDRAWN": set(),
}


def _to_status_str(x) -> str:
    """Convert Status enum or string to a plain status string."""
    return x.value if hasattr(x, "value") else str(x)


@router.post("", response_model=ApplicationOut)
def create_application(payload: ApplicationCreate, db: Session = Depends(get_db)):
    row = Application(
        company_name=payload.company_name,
        position_title=payload.position_title,
        location=payload.location,
        job_type=payload.job_type,
        source=payload.source,
        applied_date=payload.applied_date,
        current_status=Status.APPLIED,
        notes=payload.notes,
        is_deleted=False,
    )
    db.add(row)
    db.flush()  # get generated id

    db.add(
        ApplicationStatusHistory(
            application_id=row.id,
            status=Status.APPLIED,
            note="created",
        )
    )

    db.commit()
    db.refresh(row)
    return row


@router.get("", response_model=list[ApplicationOut])
def list_applications(
    include_deleted: bool = False,
    status: Optional[Status] = Query(None),
    source: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Application).order_by(Application.updated_at.desc())

    if not include_deleted:
        q = q.filter(Application.is_deleted == False)  # noqa: E712

    if status:
        status_val = _to_status_str(status)
        q = q.filter(Application.current_status == status_val)

    if source:
        q = q.filter(Application.source == source)

    return q.offset((page - 1) * size).limit(size).all()


@router.get("/{app_id}", response_model=ApplicationOut)
def get_application(app_id: int, db: Session = Depends(get_db)):
    row = db.query(Application).filter(Application.id == app_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Application not found")
    return row


@router.patch("/{app_id}", response_model=ApplicationOut)
def update_application(app_id: int, payload: ApplicationUpdate, db: Session = Depends(get_db)):
    row = (
        db.query(Application)
        .filter(Application.id == app_id, Application.is_deleted == False)  # noqa: E712
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Application not found (or deleted)")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(row, k, v)

    db.commit()
    db.refresh(row)
    return row


@router.patch("/{app_id}/status")
def update_status(app_id: int, payload: StatusUpdate, db: Session = Depends(get_db)):
    row = (
        db.query(Application)
        .filter(Application.id == app_id, Application.is_deleted == False)  # noqa: E712
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Application not found (or deleted)")

    current = _to_status_str(row.current_status)
    next_status = _to_status_str(payload.status)

    if next_status not in ALLOWED_TRANSITIONS.get(current, set()):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status transition: {current} -> {next_status}",
        )

    # update current status
    row.current_status = Status(next_status)

    # append history
    db.add(
        ApplicationStatusHistory(
            application_id=app_id,
            status=Status(next_status),
            note=payload.note,
        )
    )

    db.commit()
    return {"ok": True, "from": current, "to": next_status}


@router.delete("/{app_id}")
def soft_delete(app_id: int, db: Session = Depends(get_db)):
    row = db.query(Application).filter(Application.id == app_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Application not found")

    # keep status + deletion consistent
    row.is_deleted = True
    row.current_status = Status.WITHDRAWN

    db.add(
        ApplicationStatusHistory(
            application_id=app_id,
            status=Status.WITHDRAWN,
            note="soft deleted",
        )
    )

    db.commit()
    return {"ok": True}


@router.get("/{app_id}/history", response_model=list[HistoryOut])
def get_history(app_id: int, db: Session = Depends(get_db)):
    rows = (
        db.query(ApplicationStatusHistory)
        .filter(ApplicationStatusHistory.application_id == app_id)
        .order_by(ApplicationStatusHistory.changed_at.desc())
        .all()
    )
    return rows
