from datetime import datetime

from pydantic import BaseModel, Field


class ProjectBriefingBase(BaseModel):
    premise: str = Field(..., min_length=1)
    genre: str | None = None
    target_audience: str | None = None
    tone: str | None = None
    format: str | None = None
    duration: str | None = None
    visual_style: str | None = None
    objective: str | None = None
    references: str | None = None
    notes: str | None = None


class ProjectBriefingCreate(ProjectBriefingBase):
    pass


class ProjectBriefingUpsert(ProjectBriefingBase):
    pass


class ProjectBriefingOut(ProjectBriefingBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
