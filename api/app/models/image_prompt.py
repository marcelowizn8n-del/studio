import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ProjectImagePrompt(Base):
    __tablename__ = "project_image_prompts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("projects.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    scene_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("project_scenes.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    platform: Mapped[str] = mapped_column(String(40), default="midjourney", nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    scene = relationship("ProjectScene", back_populates="image_prompts")
