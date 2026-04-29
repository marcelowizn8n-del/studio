from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.project_briefing import ProjectBriefing
from app.models.project_story import ProjectStory
from app.models.scene import ProjectScene
from app.schemas.scene import ProjectSceneCreate, ProjectSceneUpdate


def list_project_scenes(db: Session, project_id: int) -> list[ProjectScene]:
    stmt = (
        select(ProjectScene)
        .where(ProjectScene.project_id == project_id)
        .order_by(ProjectScene.position.asc(), ProjectScene.id.asc())
    )
    return list(db.execute(stmt).scalars().all())


def get_project_scene(db: Session, project_id: int, scene_id: int) -> ProjectScene | None:
    stmt = select(ProjectScene).where(
        ProjectScene.id == scene_id,
        ProjectScene.project_id == project_id,
    )
    return db.execute(stmt).scalar_one_or_none()


def create_project_scene(db: Session, project_id: int, payload: ProjectSceneCreate) -> ProjectScene:
    next_position = len(list_project_scenes(db, project_id)) + 1
    scene = ProjectScene(
        project_id=project_id,
        position=payload.position or next_position,
        title=payload.title,
        description=payload.description,
        duration_seconds=payload.duration_seconds,
        status="draft",
    )
    db.add(scene)
    db.commit()
    db.refresh(scene)
    normalize_scene_positions(db, project_id)
    return scene


def update_project_scene(db: Session, scene: ProjectScene, payload: ProjectSceneUpdate) -> ProjectScene:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(scene, key, value)

    db.add(scene)
    db.commit()
    db.refresh(scene)
    normalize_scene_positions(db, scene.project_id)
    return scene


def delete_project_scene(db: Session, scene: ProjectScene) -> None:
    project_id = scene.project_id
    db.delete(scene)
    db.commit()
    normalize_scene_positions(db, project_id)


def generate_project_scenes(
    db: Session,
    project_id: int,
    scene_count: int = 6,
    force_regenerate: bool = True,
) -> list[ProjectScene]:
    project = db.execute(select(Project).where(Project.id == project_id)).scalar_one_or_none()
    if not project:
        raise ValueError("Projeto não encontrado")

    story = db.execute(select(ProjectStory).where(ProjectStory.project_id == project_id)).scalar_one_or_none()
    if not story:
        raise ValueError("História não encontrada para este projeto")

    if force_regenerate:
        db.execute(delete(ProjectScene).where(ProjectScene.project_id == project_id))
        db.commit()

    existing = list_project_scenes(db, project_id)
    if existing and not force_regenerate:
        return existing

    chunks = _story_to_scene_chunks(story.full_story_text or "", scene_count)
    scenes = [
        ProjectScene(
            project_id=project_id,
            position=index,
            title=f"Cena {index}",
            description=chunk,
            duration_seconds=8,
            status="generated",
        )
        for index, chunk in enumerate(chunks, start=1)
    ]
    db.add_all(scenes)
    db.commit()
    for scene in scenes:
        db.refresh(scene)
    return list_project_scenes(db, project_id)


def generate_image_prompts_for_scenes(
    db: Session,
    project_id: int,
    force_regenerate: bool = True,
) -> list[ProjectScene]:
    scenes = list_project_scenes(db, project_id)
    if not scenes:
        raise ValueError("Crie ou gere cenas antes de gerar prompts de imagem")

    briefing = db.execute(select(ProjectBriefing).where(ProjectBriefing.project_id == project_id)).scalar_one_or_none()
    visual_style = briefing.visual_style if briefing and briefing.visual_style else "cinema nostálgico brasileiro"
    tone = briefing.tone if briefing and briefing.tone else "emocional"

    for scene in scenes:
        if scene.image_prompt and not force_regenerate:
            continue
        scene.image_prompt = (
            f"{scene.title}: {scene.description}. Frame cinematográfico 16:9, {visual_style}, "
            f"tom {tone}, composição clara, luz expressiva, detalhes ambientais ricos, "
            "continuidade visual entre cenas, sem texto, sem logos, sem watermark."
        )
        scene.status = "prompts_generated"
        db.add(scene)

    db.commit()
    return list_project_scenes(db, project_id)


def generate_video_prompts_for_scenes(
    db: Session,
    project_id: int,
    force_regenerate: bool = True,
) -> list[ProjectScene]:
    scenes = list_project_scenes(db, project_id)
    if not scenes:
        raise ValueError("Crie ou gere cenas antes de gerar prompts de vídeo")

    briefing = db.execute(select(ProjectBriefing).where(ProjectBriefing.project_id == project_id)).scalar_one_or_none()
    visual_style = briefing.visual_style if briefing and briefing.visual_style else "cinema nostálgico brasileiro"
    tone = briefing.tone if briefing and briefing.tone else "emocional"

    for scene in scenes:
        if scene.video_prompt and not force_regenerate:
            continue
        scene.video_prompt = (
            f"{scene.title}, {scene.duration_seconds}s. {scene.description}. Movimento de câmera suave, "
            f"ritmo {tone}, estilo visual {visual_style}, continuidade com a cena anterior, "
            "ação natural, atmosfera memorável, sem legendas, sem texto, sem logos."
        )
        scene.status = "prompts_generated"
        db.add(scene)

    db.commit()
    return list_project_scenes(db, project_id)


def normalize_scene_positions(db: Session, project_id: int) -> None:
    scenes = list_project_scenes(db, project_id)
    for index, scene in enumerate(scenes, start=1):
        scene.position = index
        db.add(scene)
    db.commit()


def _story_to_scene_chunks(story_text: str, scene_count: int) -> list[str]:
    paragraphs = [item.strip() for item in story_text.split("\n\n") if item.strip()]
    if not paragraphs:
        paragraphs = [story_text.strip() or "Cena visual do projeto."]

    target_count = min(max(scene_count, 1), 20)
    if len(paragraphs) < target_count:
        sentences = [item.strip() for item in story_text.replace("\n", " ").split(". ") if item.strip()]
        paragraphs = sentences or paragraphs

    target_count = min(target_count, max(len(paragraphs), 1))
    chunks = ["" for _ in range(target_count)]
    for index, paragraph in enumerate(paragraphs):
        current = index % target_count
        chunks[current] = f"{chunks[current]} {paragraph}".strip()

    return [chunk[:900].rstrip() for chunk in chunks if chunk.strip()]
