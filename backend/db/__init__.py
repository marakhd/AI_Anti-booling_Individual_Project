from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, selectinload
from sqlalchemy import ForeignKey, String, Integer, Float, select

DATABASE_URL = "sqlite+aiosqlite:///db.sqlite3"

engine = create_async_engine(DATABASE_URL)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)

    telegram_id: Mapped[int] = mapped_column(unique=True)
    username: Mapped[str | None] = mapped_column(String, nullable=True)

    messages = relationship("Message", back_populates="user")


class Chat(Base):
    __tablename__ = "chats"

    id: Mapped[int] = mapped_column(primary_key=True)

    telegram_id: Mapped[int] = mapped_column(unique=True)
    title: Mapped[str | None] = mapped_column(String, nullable=True)

    messages = relationship("Message", back_populates="chat")


class Message(Base):
    __tablename__ = "toxic_messages"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    chat_id: Mapped[int] = mapped_column(ForeignKey("chats.id"))

    text: Mapped[str] = mapped_column(String)
    toxicity: Mapped[float] = mapped_column(Float)

    user = relationship("User", back_populates="messages")
    chat = relationship("Chat", back_populates="messages")


async def save_message(message, toxicity):
    async with SessionLocal() as session:

        # ищем пользователя
        user = await session.execute(
            select(User).where(User.telegram_id == message.from_user.id)
        )
        user = user.scalar_one_or_none()

        if not user:
            user = User(
                telegram_id=message.from_user.id, username=message.from_user.username
            )
            session.add(user)
            await session.flush()

        # ищем чат
        chat = await session.execute(
            select(Chat).where(Chat.telegram_id == message.chat.id)
        )
        chat = chat.scalar_one_or_none()

        if not chat:
            chat = Chat(telegram_id=message.chat.id, title=message.chat.title)
            session.add(chat)
            await session.flush()

        # сохраняем сообщение
        msg = Message(
            user_id=user.id, chat_id=chat.id, text=message.text, toxicity=toxicity
        )

        session.add(msg)

        await session.commit()


async def get_messages_db():
    async with SessionLocal() as session:
        result = await session.execute(
            select(Message).options(
                selectinload(Message.user),
                selectinload(Message.chat)
            )
        )

        return result.scalars().all()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
