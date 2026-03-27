from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.db import get_db
from app.models.entities import CommentNote, Exhibit, User
from app.schemas.payloads import ApiMsg, CommentIn, CommentOut

router = APIRouter()


@router.post("", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def create_comment(payload: CommentIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> CommentNote:
    exhibit = db.get(Exhibit, payload.exhibit_id)
    if not exhibit:
        raise HTTPException(status_code=404, detail="展品不存在")

    note = CommentNote(
        user_id=user.id,
        exhibit_id=payload.exhibit_id,
        content=payload.content,
        status="已发布",
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{comment_id}", response_model=ApiMsg)
def remove_comment(comment_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ApiMsg:
    note = db.get(CommentNote, comment_id)
    if not note:
        raise HTTPException(status_code=404, detail="评论不存在")
    if note.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="没有权限删除这条评论")
    db.delete(note)
    db.commit()
    return ApiMsg(detail="评论已删除")

