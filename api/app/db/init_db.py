from sqlalchemy import text

from app.db.base import Base
from app.db.session import engine
from app.models import Project, ProjectImagePrompt, ProjectScene, ProjectVideoPrompt  # noqa: F401


def check_database_connection() -> None:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))


def init_database() -> None:
    Base.metadata.create_all(bind=engine)
