from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ProjectVideoPrompt(Base):
    __tablename__ = "project_video_prompts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    main_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    alt_prompt_1: Mapped[str | None] = mapped_column(Text, nullable=True)
    alt_prompt_2: Mapped[str | None] = mapped_column(Text, nullable=True)
    negative_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)

    motion_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    camera_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    transition_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    sound_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    pacing_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    generation_mode: Mapped[str] = mapped_column(String(100), nullable=False, default="story_to_video_prompt_v1")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="generated")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
