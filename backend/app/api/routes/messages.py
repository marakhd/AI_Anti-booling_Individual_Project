from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Message, TelegramUser, Chat
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/messages", tags=["messages"])


class CategoryScores(BaseModel):
    toxicity: float
    severe_toxicity: float
    obscene: float
    threat: float
    insult: float
    identity_attack: float


class MessageOut(BaseModel):
    id: int
    text: str
    username: str | None
    userId: int
    chatName: str
    timestamp: str
    toxicityScore: float
    toxicityLevel: str
    categories: CategoryScores
    action: str

    class Config:
        from_attributes = True


@router.get("/", response_model=list[MessageOut])
async def get_messages(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    level: str | None = Query(None, pattern="^(safe|warning|toxic)$"),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Message, TelegramUser, Chat)
        .join(TelegramUser, Message.user_id == TelegramUser.id)
        .join(Chat, Message.chat_id == Chat.id)
        .order_by(Message.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    if level:
        query = query.where(Message.toxicity_level == level)

    result = await db.execute(query)
    rows = result.all()

    return [
        MessageOut(
            id=msg.id,
            text=msg.text,
            username=user.username or user.first_name,
            userId=user.telegram_id,
            chatName=chat.name,
            timestamp=msg.created_at.isoformat(),
            toxicityScore=msg.toxicity_score,
            toxicityLevel=msg.toxicity_level,
            categories=CategoryScores(
                toxicity=msg.toxicity_score,
                severe_toxicity=msg.severe_toxicity,
                obscene=msg.obscene,
                threat=msg.threat,
                insult=msg.insult,
                identity_attack=msg.identity_attack,
            ),
            action=msg.action_taken,
        )
        for msg, user, chat in rows
    ]


@router.get("/{message_id}", response_model=MessageOut)
async def get_message(message_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Message, TelegramUser, Chat)
        .join(TelegramUser, Message.user_id == TelegramUser.id)
        .join(Chat, Message.chat_id == Chat.id)
        .where(Message.id == message_id)
    )
    row = result.first()
    if not row:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Сообщение не найдено")

    msg, user, chat = row
    return MessageOut(
        id=msg.id,
        text=msg.text,
        username=user.username or user.first_name,
        userId=user.telegram_id,
        chatName=chat.name,
        timestamp=msg.created_at.isoformat(),
        toxicityScore=msg.toxicity_score,
        toxicityLevel=msg.toxicity_level,
        categories=CategoryScores(
            toxicity=msg.toxicity_score,
            severe_toxicity=msg.severe_toxicity,
            obscene=msg.obscene,
            threat=msg.threat,
            insult=msg.insult,
            identity_attack=msg.identity_attack,
        ),
        action=msg.action_taken,
    )
