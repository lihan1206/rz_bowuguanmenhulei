from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.db import get_db
from app.core.security import create_token, hash_pwd, verify_pwd
from app.models.entities import User
from app.schemas.payloads import ApiMsg, LoginIn, RegisterIn, UserOut

router = APIRouter()
settings = get_settings()


def bind_login_cookie(resp: Response, token: str) -> None:
    resp.set_cookie(
        key=settings.auth_cookie_name,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=settings.jwt_expire_minutes * 60,
        secure=False,
    )


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_account(payload: RegisterIn, db: Session = Depends(get_db)) -> User:
    existed = db.scalar(select(User).where(User.email == payload.email))
    if existed:
        raise HTTPException(status_code=400, detail="该邮箱已被注册")

    account = User(
        email=payload.email,
        password_hash=hash_pwd(payload.password),
        display_name=payload.display_name,
        phone=payload.phone,
        role="user",
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.post("/login", response_model=UserOut)
def login_account(payload: LoginIn, response: Response, db: Session = Depends(get_db)) -> User:
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_pwd(payload.password, user.password_hash):
        raise HTTPException(status_code=400, detail="邮箱或密码不正确")

    token = create_token(user.id, user.role)
    bind_login_cookie(response, token)
    return user


@router.post("/logout", response_model=ApiMsg)
def logout_account(response: Response) -> ApiMsg:
    response.delete_cookie(settings.auth_cookie_name)
    return ApiMsg(detail="已安全退出登录")


@router.get("/me", response_model=UserOut)
def read_me(user: User = Depends(get_current_user)) -> User:
    return user

