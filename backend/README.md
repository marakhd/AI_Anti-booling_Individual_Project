# ToxGuard Backend

FastAPI + SQLite + Detoxify + aiogram 3

## Структура

```
backend/
├── app/
│   ├── main.py                  # FastAPI app, lifespan
│   ├── core/
│   │   ├── config.py            # Настройки через .env
│   │   └── database.py          # SQLAlchemy async engine
│   ├── models/
│   │   └── models.py            # Chat, TelegramUser, Message
│   ├── services/
│   │   ├── detoxify_service.py  # Анализ текста через Detoxify
│   │   ├── moderation_service.py # Логика БД и статистика
│   │   └── bot.py               # Telegram бот (aiogram)
│   └── api/routes/
│       ├── messages.py          # GET /api/messages
│       ├── users.py             # GET /api/users, POST ban/unban
│       └── stats.py             # GET /api/stats/overview|weekly|chats
└── requirements.txt
```

## Установка и запуск

```bash
# 1. Создать виртуальное окружение
python -m venv venv
source venv/bin/activate      # Linux/Mac
venv\Scripts\activate         # Windows

# 2. Установить зависимости
pip install -r requirements.txt

# 3. Настроить переменные окружения
cp .env.example .env
# Открыть .env и вставить BOT_TOKEN и ADMIN_CHAT_ID

# 4. Запустить
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/messages` | Список сообщений (фильтр: `?level=toxic`) |
| GET | `/api/messages/{id}` | Детали сообщения |
| GET | `/api/users` | Нарушители |
| POST | `/api/users/{id}/ban` | Забанить пользователя |
| POST | `/api/users/{id}/unban` | Разбанить пользователя |
| GET | `/api/stats/overview` | Общая статистика |
| GET | `/api/stats/weekly` | Статистика за 7 дней |
| GET | `/api/stats/chats` | Статистика по чатам |

Swagger UI: http://localhost:8000/docs

## Подключение к фронту (Next.js)

В `.env.local` фронта добавь:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Затем в Next.js замени моковые данные на реальные запросы:
```ts
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/overview`)
const stats = await res.json()
```

## Как добавить бота в чат

1. Создай бота через @BotFather → получи токен
2. Добавь бота в группу как администратора
3. Дай права: удаление сообщений + ограничение участников
4. Узнай свой Telegram ID через @userinfobot
5. Вставь токен и ID в `.env`
