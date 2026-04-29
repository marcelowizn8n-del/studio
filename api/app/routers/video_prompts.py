from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.video_prompt import VideoPromptRead
from app.services import video_prompt_service

router = APIRouter(prefix="/api/v1", tags=["video prompts"])


@router.get("/projects/{project_id}/video-prompts", response_model=list[VideoPromptRead])
def list_project_video_prompts(project_id: str, db: Session = Depends(get_db)):
    return video_prompt_service.list_video_prompts(db, project_id)


@router.post("/projects/{project_id}/video-prompts/generate", response_model=list[VideoPromptRead])
def generate_project_video_prompts(project_id: str, db: Session = Depends(get_db)):
    return video_prompt_service.generate_scene_video_prompts(db, project_id)
