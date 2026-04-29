from app.db.base import Base
from app.db.session import engine

# importar models para registrar metadata
from app.models.user import User  # noqa: F401
from app.models.project import Project  # noqa: F401
from app.models.project_briefing import ProjectBriefing  # noqa: F401
from app.models.project_story import ProjectStory  # noqa: F401
from app.models.project_image_prompt import ProjectImagePrompt  # noqa: F401
from app.models.project_video_prompt import ProjectVideoPrompt  # noqa: F401


def init() -> None:
    Base.metadata.create_all(bind=engine)
    print("tables_created")


if __name__ == "__main__":
    init()
