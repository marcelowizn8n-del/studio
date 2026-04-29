from datetime import datetime

from pydantic import BaseModel


class ProjectImagePromptGenerateRequest(BaseModel):
    force_regenerate: bool = False


class ProjectImagePromptOut(BaseModel):
    id: int
    project_id: int
    title: str
    main_prompt: str
    alt_prompt_1: str | None = None
    alt_prompt_2: str | None = None
    negative_prompt: str | None = None
    composition_notes: str | None = None
    lighting_notes: str | None = None
    style_notes: str | None = None
    subject_notes: str | None = None
    generation_mode: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
