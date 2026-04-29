from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.project_briefing import ProjectBriefing
from app.models.project_image_prompt import ProjectImagePrompt
from app.models.project_story import ProjectStory
from app.models.project_video_prompt import ProjectVideoPrompt


def _b(obj, *names, default=""):
    for n in names:
        if hasattr(obj, n):
            v = getattr(obj, n)
            if v not in (None, ""):
                return v
    return default


def get_video_prompts_by_project_id(db: Session, project_id: int) -> ProjectVideoPrompt | None:
    stmt = select(ProjectVideoPrompt).where(ProjectVideoPrompt.project_id == project_id)
    return db.execute(stmt).scalar_one_or_none()


def build_video_prompts(
    project: Project,
    briefing: ProjectBriefing,
    story: ProjectStory,
    image_prompts: ProjectImagePrompt,
) -> dict:
    project_title = project.title

    genre = _b(briefing, "genre", default="cinematografico")
    audience = _b(briefing, "target_audience", "audience", default="publico geral")
    tone = _b(briefing, "tone", default="emocional")
    fmt = _b(briefing, "format", default="narrativa audiovisual curta")
    duration = _b(briefing, "duration", default="30 a 60 segundos")
    visual_style = _b(briefing, "visual_style", default="cinematic nostalgic illustration")
    objective = _b(briefing, "objective", "story_goal", default="contar a historia com impacto emocional")
    refs = _b(briefing, "references", "references_text", default="")
    notes = _b(briefing, "notes", "user_notes", default="")
    premise = _b(briefing, "premise", default="")

    main_prompt = (
        f'Create a poetic cinematic video based on the project "{project_title}".\n'
        f"Genre: {genre}.\n"
        f"Audience: {audience}.\n"
        f"Tone: {tone}.\n"
        f"Format: {fmt}.\n"
        f"Suggested duration: {duration}.\n"
        f"Visual style: {visual_style}.\n\n"
        f"Premise:\n{premise}\n\n"
        f"Story base:\n{story.full_story_text}\n\n"
        f"Image prompt base:\n{image_prompts.main_prompt}\n\n"
        f"Creative objective:\n{objective}\n\n"
        f"References:\n{refs}\n\n"
        f"Notes:\n{notes}\n\n"
        "Generate a nostalgic Brazilian cinematic sequence with emotional storytelling, "
        "childlike wonder, warm memory atmosphere, rich environmental detail, "
        "expressive movement, graceful pacing, and strong visual continuity."
    )

    alt_prompt_1 = (
        f'Opening sequence video prompt for "{project_title}": '
        "wide cinematic establishing shots, nostalgic Brazilian city atmosphere, soft sunlight, "
        "emotional environment, gentle movement, lyrical pacing, memory-like storytelling, "
        "subtle realism blended with illustration."
    )

    alt_prompt_2 = (
        f'Emotional character-focused sequence for "{project_title}": '
        "mid and close cinematic shots of the protagonist, expressive face, "
        "surrounding city memories, poetic rhythm, immersive atmosphere, "
        "visually strong emotional transitions."
    )

    negative_prompt = (
        "low quality, blurry frames, jittery motion, flickering, distorted anatomy, "
        "duplicated subjects, broken limbs, bad hands, warped face, "
        "inconsistent character design, random objects, ugly composition, "
        "flat lighting, oversaturated colors, text, subtitles, watermark, "
        "logo, frame, noisy image, poor perspective, deformed environment"
    )

    motion_notes = (
        "Use gentle cinematic motion, natural walking rhythm, subtle wind in trees and clothes, "
        "moving reflections on water, ducks gliding softly, small ambient life details, "
        "elegant subject movement with emotional realism."
    )

    camera_notes = (
        "Mix wide establishing shots, medium tracking shots, close emotional inserts, "
        "and soft push-ins. Prioritize cinematic framing, observational camera language, "
        "and a memory-like visual cadence."
    )

    transition_notes = (
        "Use poetic transitions between locations, visual continuity based on movement and emotion, "
        "soft match cuts, atmospheric dissolves, and memory-driven scene progression."
    )

    sound_notes = (
        "Ambient nostalgic city soundscape, children in the distance, birds, breeze, "
        "subtle water presence, marching band memory references, "
        "emotional instrumental underscore with delicate Brazilian sentimental tone."
    )

    pacing_notes = (
        "Keep pacing contemplative, emotional, and visually immersive. Let moments breathe. "
        "Balance child adventure energy with reflective nostalgic calm."
    )

    return {
        "title": f"{project_title} - Prompts de Video",
        "main_prompt": main_prompt,
        "alt_prompt_1": alt_prompt_1,
        "alt_prompt_2": alt_prompt_2,
        "negative_prompt": negative_prompt,
        "motion_notes": motion_notes,
        "camera_notes": camera_notes,
        "transition_notes": transition_notes,
        "sound_notes": sound_notes,
        "pacing_notes": pacing_notes,
        "generation_mode": "story_to_video_prompt_v1",
        "status": "generated",
    }


def generate_or_update_video_prompts(
    db: Session,
    project_id: int,
    force_regenerate: bool = False,
) -> ProjectVideoPrompt:
    project = db.execute(select(Project).where(Project.id == project_id)).scalar_one_or_none()
    if not project:
        raise ValueError("Projeto nao encontrado")

    briefing = db.execute(
        select(ProjectBriefing).where(ProjectBriefing.project_id == project_id)
    ).scalar_one_or_none()
    if not briefing:
        raise ValueError("Briefing nao encontrado para este projeto")

    story = db.execute(
        select(ProjectStory).where(ProjectStory.project_id == project_id)
    ).scalar_one_or_none()
    if not story:
        raise ValueError("Historia nao encontrada para este projeto")

    image_prompts = db.execute(
        select(ProjectImagePrompt).where(ProjectImagePrompt.project_id == project_id)
    ).scalar_one_or_none()
    if not image_prompts:
        raise ValueError("Prompts de imagem nao encontrados para este projeto")

    existing = get_video_prompts_by_project_id(db, project_id)

    if existing and not force_regenerate:
        return existing

    payload = build_video_prompts(project, briefing, story, image_prompts)

    if existing:
        existing.title = payload["title"]
        existing.main_prompt = payload["main_prompt"]
        existing.alt_prompt_1 = payload["alt_prompt_1"]
        existing.alt_prompt_2 = payload["alt_prompt_2"]
        existing.negative_prompt = payload["negative_prompt"]
        existing.motion_notes = payload["motion_notes"]
        existing.camera_notes = payload["camera_notes"]
        existing.transition_notes = payload["transition_notes"]
        existing.sound_notes = payload["sound_notes"]
        existing.pacing_notes = payload["pacing_notes"]
        existing.generation_mode = payload["generation_mode"]
        existing.status = payload["status"]
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing

    record = ProjectVideoPrompt(project_id=project_id, **payload)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_project_video_prompts(db: Session, project_id: int) -> ProjectVideoPrompt | None:
    return get_video_prompts_by_project_id(db, project_id)


def generate_project_video_prompts(
    db: Session,
    project_id: int,
    force_regenerate: bool = False,
) -> ProjectVideoPrompt:
    return generate_or_update_video_prompts(db, project_id, force_regenerate)
