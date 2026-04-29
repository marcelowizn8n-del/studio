from fastapi import APIRouter
from redis import Redis
from sqlalchemy import text

from app.core.config import get_settings
from app.db.session import engine

router = APIRouter(prefix="/api/v1/health", tags=["health"])


@router.get("")
def health_check():
    settings = get_settings()

    database_status = "ok"
    redis_status = "ok"

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception:
        database_status = "error"

    try:
        redis_client = Redis.from_url(settings.REDIS_URL)
        redis_client.ping()
    except Exception:
        redis_status = "error"

    overall_status = "ok" if database_status == "ok" and redis_status == "ok" else "degraded"

    return {
        "status": overall_status,
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "database": database_status,
        "redis": redis_status,
        "environment": settings.APP_ENV,
    }
