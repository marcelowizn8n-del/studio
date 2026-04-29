from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project_briefing import ProjectBriefing
from app.schemas.project_briefing import ProjectBriefingCreate, ProjectBriefingUpsert


def get_briefing_by_project_id(db: Session, project_id: int) -> ProjectBriefing | None:
    stmt = select(ProjectBriefing).where(ProjectBriefing.project_id == project_id)
    return db.execute(stmt).scalar_one_or_none()


def create_or_update_briefing(
    db: Session,
    project_id: int,
    payload: ProjectBriefingCreate | ProjectBriefingUpsert,
) -> ProjectBriefing:
    briefing = get_briefing_by_project_id(db, project_id)
    data = payload.model_dump()

    if briefing:
        briefing.premise = data["premise"]
        briefing.genre = data.get("genre")
        briefing.target_audience = data.get("target_audience")
        briefing.tone = data.get("tone")
        briefing.format = data.get("format")
        briefing.duration = data.get("duration")
        briefing.visual_style = data.get("visual_style")
        briefing.objective = data.get("objective")
        briefing.references = data.get("references")
        briefing.notes = data.get("notes")
        db.add(briefing)
        db.commit()
        db.refresh(briefing)
        return briefing

    briefing = ProjectBriefing(
        project_id=project_id,
        premise=data["premise"],
        genre=data.get("genre"),
        target_audience=data.get("target_audience"),
        tone=data.get("tone"),
        format=data.get("format"),
        duration=data.get("duration"),
        visual_style=data.get("visual_style"),
        objective=data.get("objective"),
        references=data.get("references"),
        notes=data.get("notes"),
    )
    db.add(briefing)
    db.commit()
    db.refresh(briefing)
    return briefing


# aliases para compatibilidade com código antigo
def get_project_briefing(db: Session, project_id: int) -> ProjectBriefing | None:
    return get_briefing_by_project_id(db, project_id)


def upsert_project_briefing(
    db: Session,
    project_id: int,
    payload: ProjectBriefingCreate | ProjectBriefingUpsert,
) -> ProjectBriefing:
    return create_or_update_briefing(db, project_id, payload)
