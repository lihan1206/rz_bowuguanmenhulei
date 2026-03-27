from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_admin_user
from app.core.db import get_db
from app.models.entities import Announcement, CommentNote, Exhibit, Exhibition, GuideProfile, User, VisitOrder
from app.schemas.payloads import (
    AnnouncementIn,
    AnnouncementOut,
    AdminCommentOut,
    ApiMsg,
    ExhibitIn,
    ExhibitOut,
    ExhibitionIn,
    ExhibitionOut,
    GuideIn,
    GuideOut,
    OverviewOut,
    VisitOut,
)

router = APIRouter()


def sync_entity(entity, payload) -> None:
    for key, value in payload.model_dump().items():
        setattr(entity, key, value)


@router.get("/overview", response_model=OverviewOut)
def overview(_: User = Depends(get_admin_user), db: Session = Depends(get_db)) -> OverviewOut:
    return OverviewOut(
        user_total=db.scalar(select(func.count()).select_from(User)) or 0,
        exhibit_total=db.scalar(select(func.count()).select_from(Exhibit)) or 0,
        exhibition_total=db.scalar(select(func.count()).select_from(Exhibition)) or 0,
        visit_total=db.scalar(select(func.count()).select_from(VisitOrder)) or 0,
        comment_total=db.scalar(select(func.count()).select_from(CommentNote)) or 0,
    )


@router.get("/exhibits", response_model=list[ExhibitOut])
def admin_exhibits(_: User = Depends(get_admin_user), db: Session = Depends(get_db)) -> list[ExhibitOut]:
    rows = db.execute(
        select(Exhibit, func.count(CommentNote.id).label("comments_count"))
        .outerjoin(CommentNote, CommentNote.exhibit_id == Exhibit.id)
        .group_by(Exhibit.id)
        .order_by(Exhibit.created_at.desc())
    ).all()
    return [ExhibitOut.model_validate({**item[0].__dict__, "comments_count": item[1] or 0}) for item in rows]


@router.post("/exhibits", response_model=ExhibitOut, status_code=status.HTTP_201_CREATED)
def create_exhibit(payload: ExhibitIn, _: User = Depends(get_admin_user), db: Session = Depends(get_db)) -> ExhibitOut:
    row = Exhibit(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return ExhibitOut.model_validate({**row.__dict__, "comments_count": 0})


@router.put("/exhibits/{exhibit_id}", response_model=ExhibitOut)
def update_exhibit(
    exhibit_id: int, payload: ExhibitIn, _: User = Depends(get_admin_user), db: Session = Depends(get_db)
) -> ExhibitOut:
    row = db.get(Exhibit, exhibit_id)
    if not row:
        raise HTTPException(status_code=404, detail="展品不存在")
    sync_entity(row, payload)
    db.commit()
    db.refresh(row)
    count = db.scalar(select(func.count()).select_from(CommentNote).where(CommentNote.exhibit_id == row.id)) or 0
    return ExhibitOut.model_validate({**row.__dict__, "comments_count": count})


@router.delete("/exhibits/{exhibit_id}", response_model=ApiMsg)
def delete_exhibit(exhibit_id: int, _: User = Depends(get_admin_user), db: Session = Depends(get_db)) -> ApiMsg:
    row = db.get(Exhibit, exhibit_id)
    if not row:
        raise HTTPException(status_code=404, detail="展品不存在")
    db.delete(row)
    db.commit()
    return ApiMsg(detail="展品已删除")


@router.get("/exhibitions", response_model=list[ExhibitionOut])
def admin_exhibitions(_: User = Depends(get_admin_user), db: Session = Depends(get_db)) -> list[Exhibition]:
    return list(db.scalars(select(Exhibition).order_by(Exhibition.start_date.asc())).all())


@router.post("/exhibitions", response_model=ExhibitionOut, status_code=status.HTTP_201_CREATED)
def create_exhibition(
    payload: ExhibitionIn, _: User = Depends(get_admin_user), db: Session = Depends(get_db)
) -> Exhibition:
    row = Exhibition(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/exhibitions/{item_id}", response_model=ExhibitionOut)
def update_exhibition(
    item_id: int, payload: ExhibitionIn, _: User = Depends(get_admin_user), db: Session = Depends(get_db)
) -> Exhibition:
    row = db.get(Exhibition, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="展览不存在")
    sync_entity(row, payload)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/exhibitions/{item_id}", response_model=ApiMsg)
def delete_exhibition(item_id: int, _: User = Depends(get_admin_user), db: Session = Depends(get_db)) -> ApiMsg:
    row = db.get(Exhibition, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="展览不存在")
    db.delete(row)
    db.commit()
    return ApiMsg(detail="展览已删除")


@router.get("/announcements", response_model=list[AnnouncementOut])
def admin_announcements(_: User = Depends(get_admin_user), db: Session = Depends(get_db)) -> list[Announcement]:
    stmt = select(Announcement).order_by(Announcement.pinned.desc(), Announcement.created_at.desc())
    return list(db.scalars(stmt).all())


@router.post("/announcements", response_model=AnnouncementOut, status_code=status.HTTP_201_CREATED)
def create_announcement(
    payload: AnnouncementIn, _: User = Depends(get_admin_user), db: Session = Depends(get_db)
) -> Announcement:
    row = Announcement(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/announcements/{item_id}", response_model=AnnouncementOut)
def update_announcement(
    item_id: int, payload: AnnouncementIn, _: User = Depends(get_admin_user), db: Session = Depends(get_db)
) -> Announcement:
    row = db.get(Announcement, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="公告不存在")
    sync_entity(row, payload)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/announcements/{item_id}", response_model=ApiMsg)
def delete_announcement(item_id: int, _: User = Depends(get_admin_user), db: Session = Depends(get_db)) -> ApiMsg:
    row = db.get(Announcement, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="公告不存在")
    db.delete(row)
    db.commit()
    return ApiMsg(detail="公告已删除")


@router.get("/guide", response_model=GuideOut)
def admin_guide(_: User = Depends(get_admin_user), db: Session = Depends(get_db)) -> GuideProfile:
    row = db.scalar(select(GuideProfile).limit(1))
    if not row:
        raise HTTPException(status_code=404, detail="参观指南不存在")
    return row


@router.put("/guide", response_model=GuideOut)
def update_guide(payload: GuideIn, _: User = Depends(get_admin_user), db: Session = Depends(get_db)) -> GuideProfile:
    row = db.scalar(select(GuideProfile).limit(1))
    if not row:
        row = GuideProfile(**payload.model_dump())
        db.add(row)
    else:
        sync_entity(row, payload)
    db.commit()
    db.refresh(row)
    return row


@router.get("/visits", response_model=list[VisitOut])
def admin_visits(_: User = Depends(get_admin_user), db: Session = Depends(get_db)) -> list[VisitOrder]:
    stmt = select(VisitOrder).order_by(VisitOrder.visit_date.desc(), VisitOrder.created_at.desc())
    return list(db.scalars(stmt).all())


@router.delete("/visits/{item_id}", response_model=ApiMsg)
def delete_visit(item_id: int, _: User = Depends(get_admin_user), db: Session = Depends(get_db)) -> ApiMsg:
    row = db.get(VisitOrder, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="预约记录不存在")
    db.delete(row)
    db.commit()
    return ApiMsg(detail="预约记录已删除")


@router.get("/comments", response_model=list[AdminCommentOut])
def admin_comments(_: User = Depends(get_admin_user), db: Session = Depends(get_db)) -> list[dict]:
    rows = db.scalars(select(CommentNote).order_by(CommentNote.created_at.desc())).all()
    return [
        {
            "id": item.id,
            "content": item.content,
            "status": item.status,
            "created_at": item.created_at,
            "exhibit_id": item.exhibit_id,
            "user_id": item.user_id,
        }
        for item in rows
    ]


@router.delete("/comments/{item_id}", response_model=ApiMsg)
def delete_comment(item_id: int, _: User = Depends(get_admin_user), db: Session = Depends(get_db)) -> ApiMsg:
    row = db.get(CommentNote, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="评论不存在")
    db.delete(row)
    db.commit()
    return ApiMsg(detail="评论已删除")
