from datetime import datetime

from pydantic import BaseModel


class ProjectStoryGenerateRequest(BaseModel):
    force_regenerate: bool = False


class ProjectStoryOut(BaseModel):
    id: int
    project_id: int
    title: str
    logline: str
    synopsis: str
    opening: str
    development: str
    ending: str
    full_story_text: str
    generation_mode: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
