from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.image_prompt import ImagePromptRead
from app.services import image_prompt_service

router = APIRouter(prefix="/api/v1", tags=["image prompts"])


@router.get("/projects/{project_id}/image-prompts", response_model=list[ImagePromptRead])
def list_project_image_prompts(project_id: str, db: Session = Depends(get_db)):
    return image_prompt_service.list_image_prompts(db, project_id)


@router.post("/projects/{project_id}/image-prompts/generate", response_model=list[ImagePromptRead])
def generate_project_image_prompts(project_id: str, db: Session = Depends(get_db)):
    return image_prompt_service.generate_scene_image_prompts(db, project_id)
