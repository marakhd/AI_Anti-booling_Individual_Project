"""
Telegram бот на aiogram 3.x
Подключается к чатам и модерирует сообщения в реальном времени.
"""
import asyncio
from aiogram import Bot, Dispatcher, F
from aiogram.types import Message
from aiogram.filters import Command
from sqlalchemy.ext.asyncio import AsyncSession

import logging

from app.core.config import get_settings
from app.core.database import AsyncSessionLocal
from app.services.detoxify_service import analyze_text
from app.services.moderation_service import (
    get_or_create_user,
    get_or_create_chat,
    save_message,
)

logging.basicConfig(level=logging.INFO)

settings = get_settings()

bot = Bot(token=settings.bot_token)
dp = Dispatcher()




@dp.message(Command("start", "help"))
async def cmd_start(message: Message):
    await message.answer(
        "🛡 <b>ToxGuard Bot</b> активен!\n\n"
        "Я автоматически анализирую сообщения и удаляю токсичный контент.\n\n"
        "Команды:\n"
        "/status — статус бота\n"
        "/stats — статистика чата",
        parse_mode="HTML",
    )


@dp.message(Command("status"))
async def cmd_status(message: Message):
    await message.answer(
        "✅ Бот работает\n"
        f"🎯 Порог токсичности: {int(settings.toxicity_threshold * 100)}%\n"
        f"⚠️ Порог предупреждения: {int(settings.warning_threshold * 100)}%"
    )


@dp.message(Command("stats"))
async def cmd_stats(message: Message):
    async with AsyncSessionLocal() as db:
        from app.services.moderation_service import get_stats
        stats = await get_stats(db)
    await message.answer(
        f"📊 <b>Статистика</b>\n\n"
        f"Всего сообщений: {stats['total_messages']}\n"
        f"🚫 Удалено: {stats['blocked']}\n"
        f"⚠️ Предупреждений: {stats['warned']}\n"
        f"👤 Нарушителей: {stats['violators']}\n"
        f"🔨 Заблокировано: {stats['banned_users']}",
        parse_mode="HTML",
    )




@dp.message(F.text & F.chat.type.in_({"group", "supergroup"}))
async def handle_group_message(message: Message):
    if not message.text or not message.from_user:
        return

    loop = asyncio.get_event_loop()
    analysis = await loop.run_in_executor(None, analyze_text, message.text)

    async with AsyncSessionLocal() as db:
        user = await get_or_create_user(
            db,
            telegram_id=message.from_user.id,
            username=message.from_user.username,
            first_name=message.from_user.first_name,
            last_name=message.from_user.last_name,
        )
        chat = await get_or_create_chat(
            db,
            telegram_id=message.chat.id,
            name=message.chat.title or str(message.chat.id),
        )
        saved = await save_message(
            db,
            telegram_message_id=message.message_id,
            text=message.text,
            chat=chat,
            user=user,
            analysis=analysis,
        )

    if analysis.action == "deleted":
        try:
            await message.delete()
        except Exception:
            pass

        username_str = f"@{message.from_user.username}" if message.from_user.username else message.from_user.first_name
        warn_msg = await message.answer(
            f"🚫 Сообщение от {username_str} удалено (токсичность: {analysis.toxicity_score:.0%})"
        )

        await notify_admin(message, analysis, action="deleted")

        async with AsyncSessionLocal() as db:
            from sqlalchemy import select
            from app.models.models import TelegramUser
            result = await db.execute(
                select(TelegramUser).where(TelegramUser.telegram_id == message.from_user.id)
            )
            u = result.scalar_one_or_none()
            if u and u.is_banned:
                await message.answer(
                    f"🔨 {username_str} заблокирован за систематические нарушения."
                )

    elif analysis.action == "warned":
        username_str = f"@{message.from_user.username}" if message.from_user.username else message.from_user.first_name
        await message.answer(
            f"⚠️ {username_str}, пожалуйста, соблюдай правила чата."
        )
        await notify_admin(message, analysis, action="warned")


async def notify_admin(message: Message, analysis, action: str):
    if not settings.admin_chat_id:
        return
    try:
        chat_name = message.chat.title or str(message.chat.id)
        username_str = f"@{message.from_user.username}" if message.from_user.username else message.from_user.first_name
        action_emoji = "🚫" if action == "deleted" else "⚠️"
        action_label = "УДАЛЕНО" if action == "deleted" else "ПРЕДУПРЕЖДЕНИЕ"

        await bot.send_message(
            settings.admin_chat_id,
            f"{action_emoji} <b>{action_label}</b>\n\n"
            f"👤 Пользователь: {username_str}\n"
            f"💬 Чат: {chat_name}\n"
            f"📊 Токсичность: {analysis.toxicity_score:.0%}\n\n"
            f"📝 Сообщение:\n<i>{message.text[:300]}</i>",
            parse_mode="HTML",
        )
    except Exception as e:
        print(f"Ошибка уведомления админа: {e}")


async def start_bot():
    """Запуск бота (вызывается из main.py)."""
    print("🤖 Запускаю Telegram бота...")
    await dp.start_polling(bot, skip_updates=True)
