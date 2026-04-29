from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ProjectImagePrompt(Base):
    __tablename__ = "project_image_prompts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )

    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    main_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    alt_prompt_1: Mapped[str | None] = mapped_column(Text, nullable=True)
    alt_prompt_2: Mapped[str | None] = mapped_column(Text, nullable=True)
    negative_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    composition_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    lighting_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    style_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    subject_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
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
