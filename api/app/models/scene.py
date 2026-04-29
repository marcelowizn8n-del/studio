from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ProjectScene(Base):
    __tablename__ = "project_scenes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=8)
    image_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    video_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    generated_image_base64: Mapped[str | None] = mapped_column(Text, nullable=True)
    generated_image_mime_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    image_generation_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    image_generation_size: Mapped[str | None] = mapped_column(String(40), nullable=True)
    image_generation_quality: Mapped[str | None] = mapped_column(String(40), nullable=True)
    image_generation_status: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="draft")
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
