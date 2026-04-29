from datetime import datetime

from pydantic import BaseModel, Field


class ProjectSceneCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=8)
    duration_seconds: int = Field(default=8, ge=1, le=600)
    position: int | None = Field(default=None, ge=1)


class ProjectSceneUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = Field(default=None, min_length=8)
    duration_seconds: int | None = Field(default=None, ge=1, le=600)
    position: int | None = Field(default=None, ge=1)
    image_prompt: str | None = None
    video_prompt: str | None = None
    status: str | None = Field(default=None, max_length=50)


class ProjectSceneGenerateRequest(BaseModel):
    force_regenerate: bool = True
    scene_count: int = Field(default=6, ge=1, le=20)


class ProjectScenePromptGenerateRequest(BaseModel):
    force_regenerate: bool = True


class ProjectSceneOut(BaseModel):
    id: int
    project_id: int
    position: int
    title: str
    description: str
    duration_seconds: int
    image_prompt: str | None = None
    video_prompt: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
