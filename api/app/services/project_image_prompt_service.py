from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.project_briefing import ProjectBriefing
from app.models.project_image_prompt import ProjectImagePrompt
from app.models.project_story import ProjectStory


def get_image_prompts_by_project_id(db: Session, project_id: int) -> ProjectImagePrompt | None:
    stmt = select(ProjectImagePrompt).where(ProjectImagePrompt.project_id == project_id)
    return db.execute(stmt).scalar_one_or_none()


def build_image_prompts(
    project: Project,
    briefing: ProjectBriefing,
    story: ProjectStory,
) -> dict:
    project_title = project.title
    premise = briefing.premise or "uma cena emocional"
    genre = briefing.genre or "narrativa"
    audience = briefing.target_audience or "público geral"
    tone = briefing.tone or "emocional"
    fmt = briefing.format or "narrativa visual curta"
    visual_style = briefing.visual_style or "cinematic nostalgic illustration"
    objective = briefing.objective or "criar imagens emocionais e memoráveis"
    refs = briefing.references or ""
    notes = briefing.notes or ""

    main_prompt = f"""
Create a series of cinematic illustrated images for the project "{project_title}".
Genre: {genre}.
Audience: {audience}.
Tone: {tone}.
Format: {fmt}.
Visual style: {visual_style}.

Premise:
{premise}

Story base:
{story.full_story_text}

Creative objective:
{objective}

References:
{refs}

Notes:
{notes}

Generate emotional, nostalgic, cinematic frames with Brazilian sentimental atmosphere, rich environmental detail, expressive composition, warm memory-like lighting, and strong visual continuity.
""".strip()

    alt_prompt_1 = f"""
Opening wide cinematic establishing image for "{project_title}":
nostalgic Brazilian atmosphere, soft natural light, emotional environment,
poetic framing, illustration blended with cinematic realism.
""".strip()

    alt_prompt_2 = f"""
Key emotional close-to-mid cinematic frame for "{project_title}":
expressive subject, memory-like color palette, immersive ambient detail,
delicate Brazilian sentimental tone.
""".strip()

    negative_prompt = """
low quality, blurry, distorted anatomy, extra limbs, duplicated subjects,
bad perspective, flat lighting, washed colors, text, watermark, logo,
frame, ugly face, deformed hands, oversaturated, cluttered, random objects
""".strip()

    composition_notes = """
Use cinematic composition, rule of thirds, layered foreground/midground/background,
visual depth, balanced negative space, emotional focal point.
""".strip()

    lighting_notes = """
Warm nostalgic lighting, soft shadows, golden hour tones, gentle bloom,
cinematic atmospheric haze when appropriate, memory-like color grading.
""".strip()

    style_notes = f"""
Visual style: {visual_style}.
Aesthetic: nostalgic Brazilian cinematic illustration with emotional realism,
painterly textures, refined detail, harmonious palette.
""".strip()

    subject_notes = f"""
Subject should reflect the premise: {premise}.
Audience: {audience}. Tone: {tone}. Keep emotional consistency with the story.
""".strip()

    return {
        "title": f"{project_title} — Prompts de Imagem",
        "main_prompt": main_prompt,
        "alt_prompt_1": alt_prompt_1,
        "alt_prompt_2": alt_prompt_2,
        "negative_prompt": negative_prompt,
        "composition_notes": composition_notes,
        "lighting_notes": lighting_notes,
        "style_notes": style_notes,
        "subject_notes": subject_notes,
        "generation_mode": "story_to_image_prompt_v1",
        "status": "generated",
    }


def generate_or_update_image_prompts(
    db: Session,
    project_id: int,
    force_regenerate: bool = False,
) -> ProjectImagePrompt:
    project = db.execute(select(Project).where(Project.id == project_id)).scalar_one_or_none()
    if not project:
        raise ValueError("Projeto não encontrado")

    briefing = db.execute(
        select(ProjectBriefing).where(ProjectBriefing.project_id == project_id)
    ).scalar_one_or_none()
    if not briefing:
        raise ValueError("Briefing não encontrado para este projeto")

    story = db.execute(
        select(ProjectStory).where(ProjectStory.project_id == project_id)
    ).scalar_one_or_none()
    if not story:
        raise ValueError("História não encontrada para este projeto")

    existing = get_image_prompts_by_project_id(db, project_id)

    if existing and not force_regenerate:
        return existing

    payload = build_image_prompts(project, briefing, story)

    if existing:
        existing.title = payload["title"]
        existing.main_prompt = payload["main_prompt"]
        existing.alt_prompt_1 = payload["alt_prompt_1"]
        existing.alt_prompt_2 = payload["alt_prompt_2"]
        existing.negative_prompt = payload["negative_prompt"]
        existing.composition_notes = payload["composition_notes"]
        existing.lighting_notes = payload["lighting_notes"]
        existing.style_notes = payload["style_notes"]
        existing.subject_notes = payload["subject_notes"]
        existing.generation_mode = payload["generation_mode"]
        existing.status = payload["status"]
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing

    record = ProjectImagePrompt(project_id=project_id, **payload)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


# aliases para compatibilidade com código antigo
def get_project_image_prompts(db: Session, project_id: int) -> ProjectImagePrompt | None:
    return get_image_prompts_by_project_id(db, project_id)


def generate_project_image_prompts(
    db: Session,
    project_id: int,
    force_regenerate: bool = False,
) -> ProjectImagePrompt:
    return generate_or_update_image_prompts(db, project_id, force_regenerate)
