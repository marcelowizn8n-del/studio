from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(prefix="/api/v1", tags=["hello"])


@router.get("/hello")
def hello_world():
    settings = get_settings()
    return {
        "message": "Hello World from FastAPI!",
        "project": "Story Agent V1",
        "api_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs_url": "/docs",
    }
