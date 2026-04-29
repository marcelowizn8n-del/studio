import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.init_db import init as init_db
from app.routers.auth import router as auth_router
from app.routers.health import router as health_router
from app.routers.hello import router as hello_router
from app.routers.projects import router as projects_router

APP_NAME = os.getenv("APP_NAME", "Story Agent API")
APP_VERSION = os.getenv("APP_VERSION", "0.1.0")
origins_env = os.getenv("API_CORS_ORIGINS", "https://studio.thinkingtools.io")
ALLOWED_ORIGINS = [origin.strip() for origin in origins_env.split(",") if origin.strip()]

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(hello_router)
app.include_router(auth_router)
app.include_router(projects_router)


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Story Agent API online",
        "docs_url": "/docs",
        "health_url": "/api/v1/health",
        "hello_url": "/api/v1/hello",
        "auth_register_url": "/api/v1/auth/register",
        "auth_login_url": "/api/v1/auth/login",
        "auth_me_url": "/api/v1/auth/me",
        "auth_refresh_url": "/api/v1/auth/refresh",
        "auth_logout_url": "/api/v1/auth/logout",
        "projects_url": "/api/v1/projects",
    }
