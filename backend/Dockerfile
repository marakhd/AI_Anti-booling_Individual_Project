FROM python:3.13.4-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install poetry

COPY pyproject.toml *.lock ./
RUN poetry install

COPY . .
CMD [ "poetry", "run", "py", "main.py"  ]