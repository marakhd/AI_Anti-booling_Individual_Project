from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import TelegramUser
from pydantic import BaseModel

router = APIRouter(prefix="/users", tags=["users"])


class UserOut(BaseModel):
    id: int
    telegramId: int
    username: str | None
    firstName: str
    lastName: str | None
    violations: int
    isBanned: bool
    isWarned: bool
    lastViolation: str | None
    status: str

    class Config:
        from_attributes = True


def user_to_out(u: TelegramUser) -> UserOut:
    if u.is_banned:
        status = "banned"
    elif u.is_warned:
        status = "warned"
    else:
        status = "active"

    return UserOut(
        id=u.id,
        telegramId=u.telegram_id,
        username=u.username,
        firstName=u.first_name,
        lastName=u.last_name,
        violations=u.violations_count,
        isBanned=u.is_banned,
        isWarned=u.is_warned,
        lastViolation=u.last_violation_at.isoformat() if u.last_violation_at else None,
        status=status,
    )


@router.get("/", response_model=list[UserOut])
async def get_users(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TelegramUser)
        .where(TelegramUser.violations_count > 0)
        .order_by(TelegramUser.violations_count.desc())
        .offset(skip).limit(limit)
    )
    users = result.scalars().all()
    return [user_to_out(u) for u in users]


@router.post("/{user_id}/ban")
async def ban_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TelegramUser).where(TelegramUser.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "Пользователь не найден")
    user.is_banned = True
    await db.commit()
    return {"ok": True, "message": f"Пользователь {user.first_name} заблокирован"}


@router.post("/{user_id}/unban")
async def unban_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TelegramUser).where(TelegramUser.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "Пользователь не найден")
    user.is_banned = False
    user.is_warned = False
    await db.commit()
    return {"ok": True, "message": f"Пользователь {user.first_name} разблокирован"}
