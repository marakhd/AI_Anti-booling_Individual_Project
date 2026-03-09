from jose import jwt, JWTError
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta

SECRET = "JGGSLVC88dgsaSDkabVIKGF7bvVvjdsvff&bvjfdsjkdf8Bvfds5f4dsf14fdsf21gsdffdsfsghrtgjhu,g5hddd5fg45421dfgdfgfgd3"
ALGORITHM = "HS256"

ADMIN_LOGIN = "admin"
ADMIN_PASSWORD = "admin"


def create_token(username: str):
    payload = {
        "sub": username,
        "exp": datetime.utcnow() + timedelta(hours=24),
    }

    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)


security = HTTPBearer()


def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


def verify_user(username: str, password: str):
    return username == ADMIN_LOGIN and password == ADMIN_PASSWORD