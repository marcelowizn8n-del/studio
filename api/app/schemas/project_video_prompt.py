from datetime import datetime
from pydantic import BaseModel


class ProjectVideoPromptGenerateRequest(BaseModel):
    force_regenerate: bool = False


class ProjectVideoPromptOut(BaseModel):
    id: int
    project_id: int
    title: str
    main_prompt: str
    alt_prompt_1: str | None = None
    alt_prompt_2: str | None = None
    negative_prompt: str | None = None
    motion_notes: str | None = None
    camera_notes: str | None = None
    transition_notes: str | None = None
    sound_notes: str | None = None
    pacing_notes: str | None = None
    generation_mode: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
