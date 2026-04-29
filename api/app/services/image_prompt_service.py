from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.image_prompt import ProjectImagePrompt
from app.models.scene import ProjectScene


def list_image_prompts(db: Session, project_id: str) -> list[ProjectImagePrompt]:
    return list(
        db.scalars(
            select(ProjectImagePrompt)
            .where(ProjectImagePrompt.project_id == project_id)
            .order_by(ProjectImagePrompt.created_at.desc())
        )
    )


def generate_scene_image_prompts(db: Session, project_id: str) -> list[ProjectImagePrompt]:
    scenes = list(
        db.scalars(
            select(ProjectScene)
            .where(ProjectScene.project_id == project_id)
            .order_by(ProjectScene.order.asc())
        )
    )
    db.execute(delete(ProjectImagePrompt).where(ProjectImagePrompt.project_id == project_id))
    prompts = [
        ProjectImagePrompt(
            project_id=project_id,
            scene_id=scene.id,
            platform="midjourney",
            prompt=_image_prompt_for_scene(scene),
        )
        for scene in scenes
    ]
    db.add_all(prompts)
    db.commit()
    for prompt in prompts:
        db.refresh(prompt)
    return prompts


def _image_prompt_for_scene(scene: ProjectScene) -> str:
    return (
        f"{scene.title}: {scene.description}. Cinematic keyframe, precise composition, expressive lighting, "
        "high-end production design, consistent characters, detailed environment, professional color grading, "
        "no text, no watermark --ar 16:9"
    )
