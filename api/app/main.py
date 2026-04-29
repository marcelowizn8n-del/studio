from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.init_db import init_database
from app.routers.health import router as health_router
from app.routers.hello import router as hello_router
from app.routers.image_prompts import router as image_prompts_router
from app.routers.scenes import router as scenes_router
from app.routers.video_prompts import router as video_prompts_router

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(hello_router)
app.include_router(scenes_router)
app.include_router(image_prompts_router)
app.include_router(video_prompts_router)


@app.on_event("startup")
def startup() -> None:
    init_database()


@app.get("/")
def read_root():
    return {
        "message": "Story Agent API is running",
        "hello_endpoint": "/api/v1/hello",
        "health_endpoint": "/api/v1/health",
        "docs": "/docs",
    }
