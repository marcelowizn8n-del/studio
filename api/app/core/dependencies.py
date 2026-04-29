from app.core.config import get_settings
from app.db.session import SessionLocal


def settings_dependency():
    return get_settings()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
