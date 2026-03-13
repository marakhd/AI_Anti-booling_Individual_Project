"""
ToxGuard Backend
FastAPI + SQLite + Detoxify + aiogram
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import init_db
from app.api.routes import messages, users, stats

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Старт: инициализация БД + загрузка Detoxify + запуск бота
    print("🚀 Старт ToxGuard...")
    await init_db()
    print("✅ База данных инициализирована")

    # Запускаем бота в фоне
    from app.services.bot import start_bot
    bot_task = asyncio.create_task(start_bot())

    yield

    # Остановка
    bot_task.cancel()
    try:
        await bot_task
    except asyncio.CancelledError:
        pass
    print("👋 ToxGuard остановлен")


app = FastAPI(
    title="ToxGuard API",
    description="API для системы автоматической модерации Telegram-чатов",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — разрешаем Next.js фронт
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роуты
app.include_router(messages.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(stats.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "service": "ToxGuard API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
