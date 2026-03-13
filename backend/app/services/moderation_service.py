from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.models import Message, TelegramUser, Chat
from app.services.detoxify_service import AnalysisResult
from app.core.config import get_settings

settings = get_settings()


async def get_or_create_user(
    db: AsyncSession,
    telegram_id: int,
    username: str | None,
    first_name: str,
    last_name: str | None,
) -> TelegramUser:
    result = await db.execute(
        select(TelegramUser).where(TelegramUser.telegram_id == telegram_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        user = TelegramUser(
            telegram_id=telegram_id,
            username=username,
            first_name=first_name,
            last_name=last_name,
        )
        db.add(user)
        await db.flush()

    return user


async def get_or_create_chat(
    db: AsyncSession,
    telegram_id: int,
    name: str,
) -> Chat:
    result = await db.execute(
        select(Chat).where(Chat.telegram_id == telegram_id)
    )
    chat = result.scalar_one_or_none()

    if not chat:
        chat = Chat(telegram_id=telegram_id, name=name)
        db.add(chat)
        await db.flush()

    return chat


async def save_message(
    db: AsyncSession,
    telegram_message_id: int,
    text: str,
    chat: Chat,
    user: TelegramUser,
    analysis: AnalysisResult,
) -> Message:
    """Сохраняет сообщение и обновляет счётчик нарушений пользователя."""
    message = Message(
        telegram_message_id=telegram_message_id,
        text=text,
        chat_id=chat.id,
        user_id=user.id,
        toxicity_score=analysis.toxicity_score,
        severe_toxicity=analysis.severe_toxicity,
        obscene=analysis.obscene,
        threat=analysis.threat,
        insult=analysis.insult,
        identity_attack=analysis.identity_attack,
        toxicity_level=analysis.toxicity_level,
        action_taken=analysis.action,
    )
    db.add(message)

    # Обновляем статистику пользователя при нарушении
    if analysis.action in ("deleted", "warned"):
        user.violations_count += 1
        user.last_violation_at = datetime.utcnow()

        if analysis.action == "warned" and not user.is_warned:
            user.is_warned = True

        # Авто-бан при превышении лимита
        if user.violations_count >= settings.max_violations_before_ban:
            user.is_banned = True

    await db.commit()
    await db.refresh(message)
    return message


# ── Методы для API ──────────────────────────────────────────────


async def get_messages(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    level: str | None = None,
) -> list[Message]:
    query = select(Message).order_by(Message.created_at.desc()).offset(skip).limit(limit)
    if level:
        query = query.where(Message.toxicity_level == level)
    result = await db.execute(query)
    return result.scalars().all()


async def get_users(db: AsyncSession, skip: int = 0, limit: int = 50) -> list[TelegramUser]:
    result = await db.execute(
        select(TelegramUser)
        .where(TelegramUser.violations_count > 0)
        .order_by(TelegramUser.violations_count.desc())
        .offset(skip).limit(limit)
    )
    return result.scalars().all()


async def get_stats(db: AsyncSession) -> dict:
    total = await db.scalar(select(func.count(Message.id)))
    blocked = await db.scalar(select(func.count(Message.id)).where(Message.action_taken == "deleted"))
    warned = await db.scalar(select(func.count(Message.id)).where(Message.action_taken == "warned"))
    violators = await db.scalar(select(func.count(TelegramUser.id)).where(TelegramUser.violations_count > 0))
    banned = await db.scalar(select(func.count(TelegramUser.id)).where(TelegramUser.is_banned == True))

    return {
        "total_messages": total or 0,
        "blocked": blocked or 0,
        "warned": warned or 0,
        "violators": violators or 0,
        "banned_users": banned or 0,
    }
