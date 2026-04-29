from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.project import Project
from app.models.project_briefing import ProjectBriefing
from app.models.project_story import ProjectStory
from app.models.scene import ProjectScene
from app.schemas.scene import ProjectSceneCreate, ProjectSceneUpdate

SUPPORTED_IMAGE_MODELS = {
    "gpt-image-2",
    "gpt-image-1.5",
    "gpt-image-1",
    "gpt-image-1-mini",
    "dall-e-3",
}
GPT_IMAGE_QUALITIES = {"low", "medium", "high"}
DALL_E_3_QUALITIES = {"standard", "hd"}


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


def generate_images_for_scenes(
    db: Session,
    project_id: int,
    force_regenerate: bool = True,
    model: str | None = None,
    size: str | None = None,
    quality: str | None = None,
) -> list[ProjectScene]:
    settings = get_settings()
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY não configurada")

    image_model = model or settings.OPENAI_IMAGE_MODEL
    image_size = size or settings.OPENAI_IMAGE_SIZE
    image_quality = _normalize_image_quality(image_model, quality or settings.OPENAI_IMAGE_QUALITY)
    if image_model not in SUPPORTED_IMAGE_MODELS:
        raise ValueError(f"Modelo de imagem não suportado: {image_model}")

    scenes = list_project_scenes(db, project_id)
    if not scenes:
        raise ValueError("Crie ou gere cenas antes de gerar imagens")

    try:
        from openai import OpenAI, OpenAIError
    except ImportError as exc:
        raise ValueError("Dependência openai não instalada no backend") from exc

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    mime_type = _mime_type_for_format(settings.OPENAI_IMAGE_FORMAT)

    for scene in scenes:
        if scene.generated_image_base64 and not force_regenerate:
            continue

        prompt = scene.image_prompt or (
            f"{scene.title}: {scene.description}. Frame cinematográfico 16:9, "
            "luz expressiva, composição clara, atmosfera memorável, sem texto, sem logos."
        )

        try:
            response = client.images.generate(**_build_image_generation_params(
                model=image_model,
                prompt=prompt,
                size=image_size,
                quality=image_quality,
                output_format=settings.OPENAI_IMAGE_FORMAT,
            ))
        except OpenAIError as exc:
            message = str(exc)
            if "must be verified" in message and image_model.startswith("gpt-image"):
                raise ValueError(
                    f"Sua organização OpenAI precisa ser verificada para usar o modelo {image_model}. "
                    "Verifique a organização nas configurações da OpenAI e tente novamente após a liberação."
                ) from exc
            raise ValueError(f"Erro da OpenAI ao gerar imagem: {message}") from exc

        image = response.data[0] if response.data else None
        image_base64 = getattr(image, "b64_json", None) if image else None
        if not image_base64:
            raise ValueError(f"OpenAI não retornou imagem para {scene.title}")

        scene.generated_image_base64 = image_base64
        scene.generated_image_mime_type = mime_type
        scene.image_generation_model = image_model
        scene.image_generation_size = image_size
        scene.image_generation_quality = image_quality
        scene.image_generation_status = "generated"
        scene.status = "image_generated"
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


def _mime_type_for_format(output_format: str) -> str:
    if output_format == "jpeg":
        return "image/jpeg"
    if output_format == "webp":
        return "image/webp"
    return "image/png"


def _normalize_image_quality(model: str, quality: str) -> str:
    normalized = quality.lower().strip()
    if model == "dall-e-3":
        if normalized in DALL_E_3_QUALITIES:
            return normalized
        if normalized == "high":
            return "hd"
        return "standard"

    if normalized in GPT_IMAGE_QUALITIES:
        return normalized
    if normalized == "standard":
        return "medium"
    if normalized == "hd":
        return "high"
    return "medium"


def _build_image_generation_params(
    model: str,
    prompt: str,
    size: str,
    quality: str,
    output_format: str,
) -> dict:
    params = {
        "model": model,
        "prompt": prompt,
        "size": size,
        "quality": quality,
        "n": 1,
    }
    if model == "dall-e-3":
        params["response_format"] = "b64_json"
    else:
        params["output_format"] = output_format
    return params
