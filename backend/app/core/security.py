from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings


pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()


def hash_pwd(raw_pwd: str) -> str:
    return pwd_ctx.hash(raw_pwd)


def verify_pwd(raw_pwd: str, pwd_hash: str) -> bool:
    return pwd_ctx.verify(raw_pwd, pwd_hash)


def create_token(user_id: int, role: str) -> str:
    expire_at = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expire_at,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def parse_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise ValueError("登录状态无效") from exc

