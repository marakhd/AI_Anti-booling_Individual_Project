import asyncio
import logging

from aiogram import Bot, Dispatcher, F
from aiogram.types import Message
from aiogram.utils.keyboard import InlineKeyboardBuilder, KeyboardBuilder
from aiogram.enums import ChatType
from aiogram.filters import CommandStart

from detoxify import Detoxify

from config import BOT_TOKEN, ADMIN_ID, TOXIC_THRESHOLD
from db import SessionLocal, Message, init_db

logging.basicConfig(level=logging.INFO)

tox_model = Detoxify("multilingual")

bot = Bot(BOT_TOKEN)
dp = Dispatcher()


def is_toxic(text: str) -> tuple[bool, float]:
    results = tox_model.predict(text)
    print(results)
    toxicity = float(results["toxicity"])
    return toxicity >= TOXIC_THRESHOLD, toxicity


async def save_toxic_message(message: Message, toxicity: float):
    async with SessionLocal() as session:
        obj = Message(
            user_id=message.from_user.id,
            chat_id=message.chat.id,
            text=message.text,
            toxicity=toxicity,
        )
        session.add(obj)
        await session.commit()


async def notify_admin(message: Message, toxicity: float):
    text = (
        "🚨 Обнаружено токсичное сообщение\n\n"
        f"👤 User: {message.from_user.id}\n"
        f"💬 Chat: {message.chat.id}\n"
        f"🔥 Toxicity: {toxicity:.3f}\n\n"
        f"📝 Текст:\n{message.text}"
    )
    await bot.send_message(ADMIN_ID, text)


@dp.message(CommandStart())
async def cmd_start(message: Message):
    if message.chat.type != ChatType.PRIVATE:
        await message.answer("Не забудь выдать мне права администратора!")

    bot_username = (await bot.me()).username

    await message.answer(
        "👋 Привет!\n\n"
        "Я бот для автоматической модерации токсичных сообщений.\n\n"
        "🔹 Что я умею:\n"
        "• обнаруживать буллинг\n"
        "• удалять токсичные сообщения\n"
        "• уведомлять администратора\n\n"
        "👇 Добавь меня в группу и выдай права администратора.",
        reply_markup=InlineKeyboardBuilder().button(
            text="➕ Добавить бота в чат",
            url=f"https://t.me/{bot_username}?startgroup=true",
        ),
    )


@dp.message(F.text)
async def moderate_message(message: Message):
    if message.chat.type not in (ChatType.GROUP, ChatType.SUPERGROUP):
        return

    toxic, score = is_toxic(message.text)

    if not toxic:
        return

    try:
        await message.delete()
    except Exception as e:
        logging.warning(f"Не удалось удалить сообщение: {e}")

    await save_toxic_message(message, score)
    await notify_admin(message, score)


async def start_bot():
    await init_db()
    await dp.start_polling(bot)


# if __name__ == "__main__":
#     try:
#         asyncio.run(main())
#     except (KeyboardInterrupt, SystemExit):
#         logging.info("Бот остановлен")
