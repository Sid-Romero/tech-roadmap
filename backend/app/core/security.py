"""
Security utilities: JWT tokens, password hashing, authentication.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Any

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings

# ----------------- Password Hashing -----------------
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # Good balance of security/performance
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate password hash."""
    return pwd_context.hash(password)


# ----------------- JWT Tokens -----------------
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/login",
    auto_error=False  # Don't auto-raise, we handle it
)


def create_access_token(
    subject: str | Any,
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[dict] = None
) -> str:
    """
    Create JWT access token.
    
    Args:
        subject: Token subject (usually user_id)
        expires_delta: Custom expiration time
        extra_claims: Additional JWT claims
    
    Returns:
        Encoded JWT string
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access"
    }
    
    if extra_claims:
        to_encode.update(extra_claims)
    
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


def decode_token(token: str) -> Optional[dict]:
    """
    Decode and validate JWT token.
    
    Returns:
        Token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def get_token_subject(token: str) -> Optional[str]:
    """Extract subject (user_id) from token."""
    payload = decode_token(token)
    if payload:
        return payload.get("sub")
    return None


# ----------------- Dependencies -----------------
async def get_current_user_id(
    token: Optional[str] = Depends(oauth2_scheme)
) -> str:
    """
    FastAPI dependency to get current user ID from JWT.
    Raises 401 if token is invalid or missing.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception
    
    user_id = get_token_subject(token)
    if user_id is None:
        raise credentials_exception
    
    return user_id


async def get_optional_user_id(
    token: Optional[str] = Depends(oauth2_scheme)
) -> Optional[str]:
    """
    FastAPI dependency for optional authentication.
    Returns user_id if valid token, None otherwise.
    """
    if not token:
        return None
    return get_token_subject(token)
