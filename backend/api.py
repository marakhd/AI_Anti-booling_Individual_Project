from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from auth import create_token, verify_user
from db import get_messages_db

app = FastAPI(title="AI Moderation API")

origins = [
    "http://localhost:3000",  # Next.js
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginData(BaseModel):
    username: str
    password: str


@app.post("/login")
async def login(data: LoginData):
    if not verify_user(data.username, data.password):
        raise HTTPException(401, "Invalid credentials")

    token = create_token(data.username)

    return {"token": token}


@app.get("/messages")
async def get_messages():

    messages = await get_messages_db()

    return [
        {
            "id": m.id,
            "text": m.text,
            "toxicity": m.toxicity,
            "user": m.user.username if m.user else "Unknown",
            "chat": m.chat.title if m.chat else "Unknown",
        }
        for m in messages
    ]