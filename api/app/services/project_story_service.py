from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.project_briefing import ProjectBriefing
from app.models.project_story import ProjectStory


def get_story_by_project_id(db: Session, project_id: int) -> ProjectStory | None:
    stmt = select(ProjectStory).where(ProjectStory.project_id == project_id)
    return db.execute(stmt).scalar_one_or_none()


def build_story_from_briefing(project: Project, briefing: ProjectBriefing) -> dict:
    project_title = project.title
    premise = briefing.premise or "uma história tocante"
    genre = briefing.genre or "narrativa"
    audience = briefing.target_audience or "público geral"
    tone = briefing.tone or "emocional"
    fmt = briefing.format or "narrativa curta"
    duration = briefing.duration or "curta duração"
    visual_style = briefing.visual_style or "estilo cinematográfico"
    objective = briefing.objective or "contar a história com impacto emocional"
    refs = briefing.references or ""
    notes = briefing.notes or ""

    title = f"{project_title} — História Base"

    logline = (
        f"Em uma {fmt} de {genre} com tom {tone}, voltada para {audience}, "
        f"a história parte de: {premise}"
    ).strip()

    synopsis = (
        f"Esta é uma {fmt} de {genre}, com duração estimada de {duration}, "
        f"voltada para {audience}, narrada com tom {tone} e visual {visual_style}.\n\n"
        f"Premissa: {premise}\n\n"
        f"Objetivo criativo: {objective}\n\n"
        f"Referências: {refs}\n\n"
        f"Notas: {notes}"
    ).strip()

    opening = (
        f"Abertura — Apresentamos o universo da história com tom {tone} e "
        f"estética {visual_style}. O espectador é convidado a entrar no clima "
        f"de {premise}, com atenção emocional para {audience}."
    ).strip()

    development = (
        f"Desenvolvimento — A jornada principal se aprofunda na premissa "
        f"\"{premise}\". A narrativa explora momentos sensoriais, memórias e "
        f"detalhes do ambiente, mantendo o tom {tone} e o estilo visual "
        f"{visual_style}. Referências utilizadas: {refs}."
    ).strip()

    ending = (
        f"Encerramento — A história fecha em um momento emocional alinhado ao "
        f"objetivo: {objective}. O desfecho honra o tom {tone} e deixa uma "
        f"impressão duradoura no público {audience}."
    ).strip()

    full_story_text = (
        f"{title}\n\n"
        f"Logline:\n{logline}\n\n"
        f"Sinopse:\n{synopsis}\n\n"
        f"Abertura:\n{opening}\n\n"
        f"Desenvolvimento:\n{development}\n\n"
        f"Encerramento:\n{ending}\n"
    ).strip()

    return {
        "title": title,
        "logline": logline,
        "synopsis": synopsis,
        "opening": opening,
        "development": development,
        "ending": ending,
        "full_story_text": full_story_text,
        "generation_mode": "briefing_template_v1",
        "status": "generated",
    }


def generate_or_update_story(
    db: Session,
    project_id: int,
    force_regenerate: bool = False,
) -> ProjectStory:
    project = db.execute(select(Project).where(Project.id == project_id)).scalar_one_or_none()
    if not project:
        raise ValueError("Projeto não encontrado")

    briefing = db.execute(
        select(ProjectBriefing).where(ProjectBriefing.project_id == project_id)
    ).scalar_one_or_none()
    if not briefing:
        raise ValueError("Briefing não encontrado para este projeto")

    existing = get_story_by_project_id(db, project_id)

    if existing and not force_regenerate:
        return existing

    payload = build_story_from_briefing(project, briefing)

    if existing:
        existing.title = payload["title"]
        existing.logline = payload["logline"]
        existing.synopsis = payload["synopsis"]
        existing.opening = payload["opening"]
        existing.development = payload["development"]
        existing.ending = payload["ending"]
        existing.full_story_text = payload["full_story_text"]
        existing.generation_mode = payload["generation_mode"]
        existing.status = payload["status"]
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing

    record = ProjectStory(project_id=project_id, **payload)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


# aliases para compatibilidade com código antigo
def get_project_story(db: Session, project_id: int) -> ProjectStory | None:
    return get_story_by_project_id(db, project_id)


def generate_project_story(
    db: Session,
    project_id: int,
    force_regenerate: bool = False,
) -> ProjectStory:
    return generate_or_update_story(db, project_id, force_regenerate)
