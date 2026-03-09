from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, Float

DATABASE_URL = "sqlite+aiosqlite:///db.sqlite3"

engine = create_async_engine(DATABASE_URL)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class ToxicMessage(Base):
    __tablename__ = "toxic_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer)
    chat_id: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(String)
    toxicity: Mapped[float] = mapped_column(Float)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)