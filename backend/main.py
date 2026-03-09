import asyncio
import uvicorn

from api import app
from bot import start_bot


async def start_api():
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
    )
    server = uvicorn.Server(config)
    await server.serve()


async def main():
    await asyncio.gather(
        start_api(),
        start_bot(),
    )


if __name__ == "__main__":
  try
    asyncio.run(main())
  except KeyboardInterrupt:
    print("Shutting down...")
