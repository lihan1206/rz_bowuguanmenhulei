from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.db import get_db
from app.models.entities import User, VisitOrder
from app.schemas.payloads import ApiMsg, VisitIn, VisitOut

router = APIRouter()


@router.get("/mine", response_model=list[VisitOut])
def my_visits(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[VisitOrder]:
    stmt = select(VisitOrder).where(VisitOrder.user_id == user.id).order_by(VisitOrder.visit_date.desc())
    return list(db.scalars(stmt).all())


@router.post("", response_model=VisitOut, status_code=status.HTTP_201_CREATED)
def create_visit(payload: VisitIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> VisitOrder:
    if payload.visit_date < date.today():
        raise HTTPException(status_code=400, detail="预约日期不能早于今天")

    existed = db.scalar(
        select(VisitOrder).where(VisitOrder.user_id == user.id, VisitOrder.visit_date == payload.visit_date)
    )
    if existed:
        raise HTTPException(status_code=400, detail="同一天只能保留一条预约记录")

    record = VisitOrder(
        user_id=user.id,
        visitor_name=payload.visitor_name,
        phone=payload.phone,
        visit_date=payload.visit_date,
        party_size=payload.party_size,
        note=payload.note,
        status="已预约",
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{visit_id}", response_model=ApiMsg)
def cancel_visit(visit_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ApiMsg:
    record = db.get(VisitOrder, visit_id)
    if not record or record.user_id != user.id:
        raise HTTPException(status_code=404, detail="预约记录不存在")
    db.delete(record)
    db.commit()
    return ApiMsg(detail="预约已取消")

