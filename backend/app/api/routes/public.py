from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from fastapi import APIRouter, Depends, HTTPException

from app.core.db import get_db
from app.models.entities import Announcement, CommentNote, Exhibit, Exhibition, GuideProfile
from app.schemas.payloads import AnnouncementOut, ExhibitDetail, ExhibitOut, ExhibitionOut, GuideOut, HomePayload

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/home", response_model=HomePayload)
def get_home_data(db: Session = Depends(get_db)) -> HomePayload:
    guide = db.scalar(select(GuideProfile).limit(1))
    if not guide:
        raise HTTPException(status_code=500, detail="参观指南尚未配置")

    exhibit_rows = db.execute(
        select(Exhibit, func.count(CommentNote.id).label("comments_count"))
        .outerjoin(CommentNote, CommentNote.exhibit_id == Exhibit.id)
        .group_by(Exhibit.id)
        .order_by(Exhibit.created_at.desc())
        .limit(6)
    ).all()
    exhibition_rows = db.scalars(
        select(Exhibition).order_by(Exhibition.start_date.asc()).limit(4)
    ).all()
    announce_rows = db.scalars(
        select(Announcement).order_by(Announcement.pinned.desc(), Announcement.created_at.desc()).limit(4)
    ).all()
    exhibit_total = db.scalar(select(func.count()).select_from(Exhibit)) or 0
    exhibition_total = db.scalar(select(func.count()).select_from(Exhibition)) or 0

    exhibits = [
        ExhibitOut.model_validate({**item[0].__dict__, "comments_count": item[1] or 0})
        for item in exhibit_rows
    ]

    return HomePayload(
        exhibits=exhibits,
        exhibitions=exhibition_rows,
        announcements=announce_rows,
        guide=GuideOut.model_validate(guide),
        total_exhibits=exhibit_total,
        total_exhibitions=exhibition_total,
    )


@router.get("/exhibits", response_model=list[ExhibitOut])
def list_exhibits(q: str | None = None, db: Session = Depends(get_db)) -> list[ExhibitOut]:
    stmt = (
        select(Exhibit, func.count(CommentNote.id).label("comments_count"))
        .outerjoin(CommentNote, CommentNote.exhibit_id == Exhibit.id)
        .group_by(Exhibit.id)
        .order_by(Exhibit.created_at.desc())
    )
    if q:
        stmt = stmt.where(
            or_(
                Exhibit.name.ilike(f"%{q}%"),
                Exhibit.category.ilike(f"%{q}%"),
                Exhibit.era.ilike(f"%{q}%"),
                Exhibit.hall_name.ilike(f"%{q}%"),
            )
        )

    rows = db.execute(stmt).all()
    return [ExhibitOut.model_validate({**item[0].__dict__, "comments_count": item[1] or 0}) for item in rows]


@router.get("/exhibits/{exhibit_id}", response_model=ExhibitDetail)
def get_exhibit_detail(exhibit_id: int, db: Session = Depends(get_db)) -> ExhibitDetail:
    exhibit = (
        db.execute(
            select(Exhibit)
            .options(joinedload(Exhibit.comments).joinedload(CommentNote.user))
            .where(Exhibit.id == exhibit_id)
        )
        .unique()
        .scalar_one_or_none()
    )
    if not exhibit:
        raise HTTPException(status_code=404, detail="展品不存在")

    comments = sorted(exhibit.comments, key=lambda item: item.created_at, reverse=True)
    return ExhibitDetail.model_validate(
        {
            **exhibit.__dict__,
            "comments_count": len(comments),
            "comments": comments,
        }
    )


@router.get("/exhibitions", response_model=list[ExhibitionOut])
def list_exhibitions(q: str | None = None, db: Session = Depends(get_db)) -> list[Exhibition]:
    stmt = select(Exhibition).order_by(Exhibition.start_date.asc())
    if q:
        stmt = stmt.where(
            or_(
                Exhibition.title.ilike(f"%{q}%"),
                Exhibition.location.ilike(f"%{q}%"),
                Exhibition.status.ilike(f"%{q}%"),
            )
        )
    return list(db.scalars(stmt).all())


@router.get("/announcements", response_model=list[AnnouncementOut])
def list_announcements(db: Session = Depends(get_db)) -> list[Announcement]:
    return list(
        db.scalars(select(Announcement).order_by(Announcement.pinned.desc(), Announcement.created_at.desc())).all()
    )


@router.get("/guide", response_model=GuideOut)
def get_guide(db: Session = Depends(get_db)) -> GuideProfile:
    guide = db.scalar(select(GuideProfile).limit(1))
    if not guide:
        raise HTTPException(status_code=404, detail="参观指南不存在")
    return guide
