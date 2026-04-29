from datetime import datetime

from pydantic import BaseModel


class ImagePromptRead(BaseModel):
    id: str
    project_id: str
    scene_id: str | None
    platform: str
    prompt: str
    created_at: datetime

    model_config = {"from_attributes": True}
