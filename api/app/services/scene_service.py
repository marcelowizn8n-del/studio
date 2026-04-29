from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.scene import ProjectScene
from app.schemas.scene import SceneCreate, SceneGenerateRequest, SceneUpdate


def list_scenes(db: Session, project_id: str) -> list[ProjectScene]:
    return list(
        db.scalars(
            select(ProjectScene)
            .where(ProjectScene.project_id == project_id)
            .order_by(ProjectScene.order.asc(), ProjectScene.created_at.asc())
        )
    )


def create_scene(db: Session, project_id: str, payload: SceneCreate) -> ProjectScene:
    order = payload.order or (len(list_scenes(db, project_id)) + 1)
    scene = ProjectScene(project_id=project_id, order=order, **payload.model_dump(exclude={"order"}))
    db.add(scene)
    db.commit()
    db.refresh(scene)
    normalize_scene_order(db, project_id)
    return scene


def update_scene(db: Session, scene: ProjectScene, payload: SceneUpdate) -> ProjectScene:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(scene, key, value)
    db.add(scene)
    db.commit()
    db.refresh(scene)
    normalize_scene_order(db, scene.project_id)
    return scene


def delete_scene(db: Session, scene: ProjectScene) -> None:
    project_id = scene.project_id
    db.delete(scene)
    db.commit()
    normalize_scene_order(db, project_id)


def get_scene(db: Session, scene_id: str) -> ProjectScene | None:
    return db.get(ProjectScene, scene_id)


def generate_scenes(db: Session, project_id: str, payload: SceneGenerateRequest) -> list[ProjectScene]:
    if payload.replace_existing:
        db.execute(delete(ProjectScene).where(ProjectScene.project_id == project_id))
        db.commit()

    scenes = _split_story_into_scenes(payload.story_text, payload.scene_count)
    start_order = len(list_scenes(db, project_id)) + 1
    created = [
        ProjectScene(
            project_id=project_id,
            order=start_order + index,
            title=scene["title"],
            description=scene["description"],
            duration_seconds=scene["duration_seconds"],
        )
        for index, scene in enumerate(scenes)
    ]
    db.add_all(created)
    db.commit()
    for scene in created:
        db.refresh(scene)
    return list_scenes(db, project_id)


def normalize_scene_order(db: Session, project_id: str) -> None:
    scenes = list_scenes(db, project_id)
    for index, scene in enumerate(scenes, start=1):
        scene.order = index
        db.add(scene)
    db.commit()


def _split_story_into_scenes(story_text: str, scene_count: int) -> list[dict[str, str | int]]:
    paragraphs = [part.strip() for part in story_text.split("\n") if part.strip()]
    if not paragraphs:
        paragraphs = [story_text.strip()]

    chunks = _balanced_chunks(paragraphs, scene_count)
    scenes = []
    for index, chunk in enumerate(chunks, start=1):
        description = " ".join(chunk).strip()
        if len(description) > 900:
            description = f"{description[:897].rstrip()}..."
        scenes.append(
            {
                "title": f"Cena {index}",
                "description": description,
                "duration_seconds": 8,
            }
        )
    return scenes


def _balanced_chunks(items: list[str], target_count: int) -> list[list[str]]:
    count = min(max(target_count, 1), max(len(items), 1))
    chunks: list[list[str]] = [[] for _ in range(count)]
    for index, item in enumerate(items):
        chunks[index % count].append(item)
    return [chunk for chunk in chunks if chunk]
