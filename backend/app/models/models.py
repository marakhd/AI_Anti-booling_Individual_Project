from datetime import datetime
from sqlalchemy import Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Chat(Base):
    """Telegram-чат подключённый к боту."""
    __tablename__ = "chats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    telegram_id: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    messages: Mapped[list["Message"]] = relationship("Message", back_populates="chat")

    @property
    def messages_total(self) -> int:
        return len(self.messages)


class TelegramUser(Base):
    """Пользователь Telegram."""
    __tablename__ = "telegram_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    telegram_id: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    username: Mapped[str | None] = mapped_column(String(255), nullable=True)
    first_name: Mapped[str] = mapped_column(String(255))
    last_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    violations_count: Mapped[int] = mapped_column(Integer, default=0)
    is_banned: Mapped[bool] = mapped_column(Boolean, default=False)
    is_warned: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_violation_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    messages: Mapped[list["Message"]] = relationship("Message", back_populates="user")


class Message(Base):
    """Проанализированное сообщение."""
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    telegram_message_id: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text)

    # Связи
    chat_id: Mapped[int] = mapped_column(Integer, ForeignKey("chats.id"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("telegram_users.id"))
    chat: Mapped["Chat"] = relationship("Chat", back_populates="messages")
    user: Mapped["TelegramUser"] = relationship("TelegramUser", back_populates="messages")

    # Результаты Detoxify
    toxicity_score: Mapped[float] = mapped_column(Float)
    severe_toxicity: Mapped[float] = mapped_column(Float, default=0.0)
    obscene: Mapped[float] = mapped_column(Float, default=0.0)
    threat: Mapped[float] = mapped_column(Float, default=0.0)
    insult: Mapped[float] = mapped_column(Float, default=0.0)
    identity_attack: Mapped[float] = mapped_column(Float, default=0.0)

    # Решение
    toxicity_level: Mapped[str] = mapped_column(String(20))  # safe / warning / toxic
    action_taken: Mapped[str] = mapped_column(String(20))    # passed / warned / deleted

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
