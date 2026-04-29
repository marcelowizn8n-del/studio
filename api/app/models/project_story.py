from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ProjectStory(Base):
    __tablename__ = "project_stories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )

    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    logline: Mapped[str | None] = mapped_column(Text, nullable=True)
    synopsis: Mapped[str | None] = mapped_column(Text, nullable=True)
    opening: Mapped[str | None] = mapped_column(Text, nullable=True)
    development: Mapped[str | None] = mapped_column(Text, nullable=True)
    ending: Mapped[str | None] = mapped_column(Text, nullable=True)
    full_story_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    generation_mode: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="generated")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
