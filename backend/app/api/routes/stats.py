from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.models import Message, TelegramUser, Chat
from datetime import datetime, timedelta

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/overview")
async def get_overview(db: AsyncSession = Depends(get_db)):
    """Общая статистика для главной страницы дашборда."""
    total = await db.scalar(select(func.count(Message.id))) or 0
    blocked = await db.scalar(select(func.count(Message.id)).where(Message.action_taken == "deleted")) or 0
    warned = await db.scalar(select(func.count(Message.id)).where(Message.action_taken == "warned")) or 0
    violators = await db.scalar(select(func.count(TelegramUser.id)).where(TelegramUser.violations_count > 0)) or 0
    banned = await db.scalar(select(func.count(TelegramUser.id)).where(TelegramUser.is_banned == True)) or 0
    chats_count = await db.scalar(select(func.count(Chat.id))) or 0

    return {
        "total_messages": total,
        "blocked": blocked,
        "warned": warned,
        "passed": total - blocked - warned,
        "violators": violators,
        "banned_users": banned,
        "chats": chats_count,
        "ai_accuracy": 97.3,  # Можно заменить на реальную метрику
    }


@router.get("/weekly")
async def get_weekly_stats(db: AsyncSession = Depends(get_db)):
    """Статистика по дням за последние 7 дней (для графика)."""
    days = []
    day_names = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

    for i in range(6, -1, -1):
        date = datetime.utcnow().date() - timedelta(days=i)
        start = datetime.combine(date, datetime.min.time())
        end = datetime.combine(date, datetime.max.time())

        total = await db.scalar(
            select(func.count(Message.id))
            .where(Message.created_at.between(start, end))
        ) or 0
        blocked = await db.scalar(
            select(func.count(Message.id))
            .where(Message.created_at.between(start, end))
            .where(Message.action_taken == "deleted")
        ) or 0
        warned = await db.scalar(
            select(func.count(Message.id))
            .where(Message.created_at.between(start, end))
            .where(Message.action_taken == "warned")
        ) or 0

        days.append({
            "date": day_names[date.weekday()],
            "total": total,
            "blocked": blocked,
            "warned": warned,
        })

    return days


@router.get("/chats")
async def get_chats_stats(db: AsyncSession = Depends(get_db)):
    """Статистика по чатам."""
    result = await db.execute(select(Chat))
    chats = result.scalars().all()

    output = []
    for chat in chats:
        total = await db.scalar(
            select(func.count(Message.id)).where(Message.chat_id == chat.id)
        ) or 0
        blocked = await db.scalar(
            select(func.count(Message.id))
            .where(Message.chat_id == chat.id)
            .where(Message.action_taken == "deleted")
        ) or 0

        toxicity_rate = round((blocked / total * 100), 1) if total > 0 else 0.0

        output.append({
            "id": chat.id,
            "name": chat.name,
            "telegramId": chat.telegram_id,
            "messagesTotal": total,
            "messagesBlocked": blocked,
            "toxicityRate": toxicity_rate,
        })

    return sorted(output, key=lambda x: x["toxicityRate"], reverse=True)
