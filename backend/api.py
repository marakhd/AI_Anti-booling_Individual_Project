from fastapi import FastAPI

app = FastAPI(title="AI Moderation API")


@app.get("/")
async def root():
    return {"status": "ok"}