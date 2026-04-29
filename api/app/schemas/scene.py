from datetime import datetime

from pydantic import BaseModel, Field


class SceneBase(BaseModel):
    title: str = Field(min_length=2, max_length=160)
    description: str = Field(min_length=8)
    duration_seconds: int = Field(default=8, ge=1, le=600)


class SceneCreate(SceneBase):
    order: int | None = Field(default=None, ge=1)


class SceneUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=160)
    description: str | None = Field(default=None, min_length=8)
    duration_seconds: int | None = Field(default=None, ge=1, le=600)
    order: int | None = Field(default=None, ge=1)


class SceneGenerateRequest(BaseModel):
    story_text: str = Field(min_length=20)
    scene_count: int = Field(default=6, ge=1, le=20)
    replace_existing: bool = True


class SceneRead(SceneBase):
    id: str
    project_id: str
    order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
