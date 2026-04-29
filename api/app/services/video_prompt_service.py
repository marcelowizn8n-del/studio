from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.scene import ProjectScene
from app.models.video_prompt import ProjectVideoPrompt


def list_video_prompts(db: Session, project_id: str) -> list[ProjectVideoPrompt]:
    return list(
        db.scalars(
            select(ProjectVideoPrompt)
            .where(ProjectVideoPrompt.project_id == project_id)
            .order_by(ProjectVideoPrompt.created_at.desc())
        )
    )


def generate_scene_video_prompts(db: Session, project_id: str) -> list[ProjectVideoPrompt]:
    scenes = list(
        db.scalars(
            select(ProjectScene)
            .where(ProjectScene.project_id == project_id)
            .order_by(ProjectScene.order.asc())
        )
    )
    db.execute(delete(ProjectVideoPrompt).where(ProjectVideoPrompt.project_id == project_id))
    prompts = [
        ProjectVideoPrompt(
            project_id=project_id,
            scene_id=scene.id,
            platform="runway",
            prompt=_video_prompt_for_scene(scene),
        )
        for scene in scenes
    ]
    db.add_all(prompts)
    db.commit()
    for prompt in prompts:
        db.refresh(prompt)
    return prompts


def _video_prompt_for_scene(scene: ProjectScene) -> str:
    return (
        f"{scene.title}, {scene.duration_seconds}s. {scene.description}. Smooth cinematic camera movement, "
        "clear subject motivation, natural motion continuity, realistic lighting changes, no captions, "
        "no logos, no cuts inside the shot."
    )
