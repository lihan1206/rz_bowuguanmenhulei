from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class ApiMsg(BaseModel):
    detail: str


class UserOut(BaseModel):
    id: int
    email: str
    display_name: str
    phone: str | None
    role: str

    model_config = {"from_attributes": True}


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=32)
    display_name: str = Field(min_length=2, max_length=20)
    phone: str | None = Field(default=None, max_length=20)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=32)


class ExhibitBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    era: str = Field(min_length=2, max_length=60)
    category: str = Field(min_length=2, max_length=40)
    hall_name: str = Field(min_length=2, max_length=80)
    summary: str = Field(min_length=8, max_length=240)
    detail: str = Field(min_length=20, max_length=4000)
    image_url: str = Field(min_length=5, max_length=255)


class ExhibitIn(ExhibitBase):
    pass


class ExhibitOut(ExhibitBase):
    id: int
    created_at: datetime
    comments_count: int = 0

    model_config = {"from_attributes": True}


class CommentIn(BaseModel):
    exhibit_id: int
    content: str = Field(min_length=4, max_length=280)


class CommentOut(BaseModel):
    id: int
    exhibit_id: int
    content: str
    status: str
    created_at: datetime
    user: UserOut

    model_config = {"from_attributes": True}


class ExhibitDetail(ExhibitOut):
    comments: list[CommentOut]


class ExhibitionBase(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    location: str = Field(min_length=2, max_length=80)
    start_date: date
    end_date: date
    status: Literal["展出中", "即将开展", "已结束"]
    summary: str = Field(min_length=10, max_length=4000)
    poster_url: str = Field(min_length=5, max_length=255)


class ExhibitionIn(ExhibitionBase):
    pass


class ExhibitionOut(ExhibitionBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class AnnouncementIn(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    content: str = Field(min_length=6, max_length=2000)
    pinned: bool = False


class AnnouncementOut(AnnouncementIn):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class GuideIn(BaseModel):
    open_hours: str = Field(min_length=4, max_length=120)
    address: str = Field(min_length=4, max_length=200)
    traffic_guide: str = Field(min_length=10, max_length=2000)
    ticket_info: str = Field(min_length=4, max_length=1000)
    map_link: str = Field(min_length=5, max_length=255)
    visit_tips: str = Field(min_length=10, max_length=2000)


class GuideOut(GuideIn):
    id: int
    updated_at: datetime

    model_config = {"from_attributes": True}


class VisitIn(BaseModel):
    visitor_name: str = Field(min_length=2, max_length=80)
    phone: str = Field(min_length=6, max_length=20)
    visit_date: date
    party_size: int = Field(ge=1, le=6)
    note: str | None = Field(default=None, max_length=240)


class VisitOut(VisitIn):
    id: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class HomePayload(BaseModel):
    exhibits: list[ExhibitOut]
    exhibitions: list[ExhibitionOut]
    announcements: list[AnnouncementOut]
    guide: GuideOut
    total_exhibits: int
    total_exhibitions: int


class OverviewOut(BaseModel):
    user_total: int
    exhibit_total: int
    exhibition_total: int
    visit_total: int
    comment_total: int


class AdminCommentOut(BaseModel):
    id: int
    content: str
    status: str
    created_at: datetime
    exhibit_id: int
    user_id: int
