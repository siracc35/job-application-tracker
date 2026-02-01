from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.application import Application

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
def summary(
    include_deleted: bool = Query(False),
    db: Session = Depends(get_db),
):
    base_q = db.query(Application)
    if not include_deleted:
        base_q = base_q.filter(Application.is_deleted == False)  # noqa: E712

    total = base_q.with_entities(func.count(Application.id)).scalar() or 0

    by_status_rows = (
        base_q.with_entities(Application.current_status, func.count(Application.id))
        .group_by(Application.current_status)
        .all()
    )

    by_source_rows = (
        base_q.with_entities(Application.source, func.count(Application.id))
        .group_by(Application.source)
        .all()
    )

    interview_count = (
        base_q.with_entities(func.count(Application.id))
        .filter(Application.current_status.in_(["HR_INTERVIEW", "TECH_INTERVIEW", "CASE_STUDY"]))
        .scalar()
        or 0
    )

    # last 7 days (based on applied_date)
    seven_days_ago = date.today() - timedelta(days=7)
    last_7_days = (
        base_q.with_entities(func.count(Application.id))
        .filter(Application.applied_date.isnot(None))
        .filter(Application.applied_date >= seven_days_ago)
        .scalar()
        or 0
    )

    return {
        "total_applications": int(total),
        "by_status": {str(s): int(c) for s, c in by_status_rows},
        "by_source": {str(src) if src is not None else "UNKNOWN": int(c) for src, c in by_source_rows},
        "interview_count": int(interview_count),
        "interview_rate": (float(interview_count) / float(total)) if total else 0.0,
        "applied_last_7_days": int(last_7_days),
        "include_deleted": bool(include_deleted),
    }

@router.get("/timeline")
def timeline(
    days: int = Query(30, ge=7, le=365),
    include_deleted: bool = Query(False),
    db: Session = Depends(get_db),
):
    """
    Returns daily application counts for the last `days` days.
    Uses `applied_date` (DATE). Fills missing days with 0.
    """
    start_day = date.today() - timedelta(days=days - 1)

    q = db.query(
        Application.applied_date.label("day"),
        func.count(Application.id).label("count"),
    ).filter(Application.applied_date.isnot(None))

    if not include_deleted:
        q = q.filter(Application.is_deleted == False)  # noqa: E712

    q = q.filter(Application.applied_date >= start_day)
    q = q.group_by(Application.applied_date).order_by(Application.applied_date.asc())

    rows = q.all()
    counts_map = {r.day: int(r.count) for r in rows}

    series = []
    for i in range(days):
        d = start_day + timedelta(days=i)
        series.append({"date": d.isoformat(), "count": counts_map.get(d, 0)})

    return {
        "days": days,
        "from": start_day.isoformat(),
        "to": date.today().isoformat(),
        "series": series,
        "include_deleted": bool(include_deleted),
    }
