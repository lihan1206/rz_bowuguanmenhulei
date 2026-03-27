import logging
import time
from datetime import date, timedelta

from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.core.db import Base, SessionLocal, engine
from app.core.security import hash_pwd
from app.models.entities import Announcement, Exhibit, Exhibition, GuideProfile, User

log = logging.getLogger("bootstrap")
ADMIN_EMAIL = "admin@museumportal.com"
LEGACY_ADMIN_EMAIL = "admin@museum.local"
VISITOR_EMAIL = "user@example.com"


def wait_for_database(max_try: int = 20) -> None:
    for idx in range(max_try):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return
        except Exception:
            log.info("数据库连接准备中，第 %s 次重试", idx + 1)
            time.sleep(2)
    raise RuntimeError("数据库连接失败")


def init_database() -> None:
    wait_for_database()
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        normalize_builtin_accounts(db)
        seed_if_needed(db)


def normalize_builtin_accounts(db: Session) -> None:
    legacy_admin = db.scalar(select(User).where(User.email == LEGACY_ADMIN_EMAIL))
    if legacy_admin and not db.scalar(select(User.id).where(User.email == ADMIN_EMAIL)):
        legacy_admin.email = ADMIN_EMAIL
        db.commit()
        log.info("已修正历史管理员账号邮箱")


def seed_if_needed(db: Session) -> None:
    has_user = db.scalar(select(User.id).limit(1))
    if has_user:
        return

    admin = User(
        email=ADMIN_EMAIL,
        password_hash=hash_pwd("123456"),
        display_name="系统管理员",
        phone="13800000000",
        role="admin",
    )
    visitor = User(
        email=VISITOR_EMAIL,
        password_hash=hash_pwd("123456"),
        display_name="预约游客",
        phone="13900000000",
        role="user",
    )
    db.add_all([admin, visitor])

    exhibits = [
        Exhibit(
            name="青铜云雷纹鼎",
            era="西周晚期",
            category="青铜器",
            hall_name="一层青铜文明厅",
            summary="器身饰云雷纹与兽面纹，铸造层次完整，是礼制器物中的代表展品。",
            detail="该鼎出土于中原地区大型遗址，器形敦厚，腹部饱满，纹饰布局严谨，反映了西周晚期礼乐制度与铸铜工艺的成熟水平。",
            image_url="/media/exhibit-bronze.svg",
        ),
        Exhibit(
            name="山水长卷摹本",
            era="明代",
            category="书画",
            hall_name="二层书画厅",
            summary="长卷以层峦、云水、舟桥为主景，色调清润，适合公众近距离阅读式观展。",
            detail="作品以游观式构图展开，强调山势与水系的节奏关系，局部保留题跋与钤印信息，可用于书画教育与公众导览。",
            image_url="/media/exhibit-scroll.svg",
        ),
        Exhibit(
            name="海贸陶瓷执壶",
            era="宋代",
            category="陶瓷",
            hall_name="三层海丝展厅",
            summary="器型修长，釉色温润，兼具日常使用与外销审美特征。",
            detail="执壶釉层细腻，流口与把手线条舒展，体现宋代制瓷工艺的精细控制，也见证了古代海上贸易线路的文化传播。",
            image_url="/media/exhibit-ceramic.svg",
        ),
        Exhibit(
            name="机械计时仪复原件",
            era="近代",
            category="科技",
            hall_name="四层科学探索厅",
            summary="展示齿轮联动结构与时间刻度设计，是科技展区的互动焦点。",
            detail="复原件依据馆藏资料制作，保留原器械的齿轮布局与指针转动逻辑，帮助公众理解近代机械计时技术的工作方式。",
            image_url="/media/exhibit-clock.svg",
        ),
    ]

    today = date.today()
    exhibitions = [
        Exhibition(
            title="青铜礼乐与王朝秩序",
            location="一层特展厅",
            start_date=today - timedelta(days=10),
            end_date=today + timedelta(days=35),
            status="展出中",
            summary="以青铜器组合陈列和礼制图谱呈现先秦政治结构与工艺制度，适合学生团队和公共教育活动预约参观。",
            poster_url="/media/expo-bronze.svg",
        ),
        Exhibition(
            title="笔墨里的江河山川",
            location="二层临展厅",
            start_date=today + timedelta(days=7),
            end_date=today + timedelta(days=67),
            status="即将开展",
            summary="聚焦山水画中的空间叙事与观展动线设计，结合数字导览卡片，适合亲子观众使用。",
            poster_url="/media/expo-landscape.svg",
        ),
    ]

    notes = [
        Announcement(
            title="清明假期开放安排",
            content="4月4日至4月6日正常开放，入馆高峰时段建议提前在线预约。",
            pinned=True,
        ),
        Announcement(
            title="三层展厅灯光维护通知",
            content="本周六上午 9:00 至 11:00 三层局部区域进行灯光维护，请按现场引导参观。",
            pinned=False,
        ),
    ]

    guide = GuideProfile(
        open_hours="周二至周日 09:00-17:30，16:45 停止入馆",
        address="上海市静安区文博路 88 号",
        traffic_guide="地铁 2 号线与 7 号线换乘后可步行到馆；自驾观众可使用西侧地下停车场，周末建议优先公共交通出行。",
        ticket_info="常设展免费开放，特展需单独预约。学生、教师与 60 岁以上观众可凭有效证件走优先检票通道。",
        map_link="https://maps.apple.com/?q=%E4%B8%8A%E6%B5%B7%E5%B8%82%E9%9D%99%E5%AE%89%E5%8C%BA%E6%96%87%E5%8D%9A%E8%B7%AF88%E5%8F%B7",
        visit_tips="请勿携带大型箱包进入展厅，馆内支持轮椅借用和母婴休息区。热门展建议提前 20 分钟到馆完成检票。",
    )

    db.add_all(exhibits + exhibitions + notes + [guide])
    db.commit()
    log.info("初始化数据写入完成")
