from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


def list_projects(db: Session, user_id: int) -> list[Project]:
    stmt = (
        select(Project)
        .where(Project.user_id == user_id)
        .order_by(Project.created_at.desc())
    )
    return list(db.execute(stmt).scalars().all())


def get_project_by_id(db: Session, project_id: int, user_id: int) -> Project | None:
    stmt = select(Project).where(
        Project.id == project_id,
        Project.user_id == user_id,
    )
    return db.execute(stmt).scalar_one_or_none()


def create_project(db: Session, user_id: int, payload: ProjectCreate) -> Project:
    try:
        project = Project(
            user_id=user_id,
            title=payload.title.strip(),
            description=payload.description.strip() if payload.description else None,
            status=payload.status,
        )

        db.add(project)
        db.flush()

        created_id = project.id

        db.commit()

        persisted = db.execute(
            select(Project).where(
                Project.id == created_id,
                Project.user_id == user_id,
            )
        ).scalar_one_or_none()

        if not persisted:
            raise RuntimeError("Projeto não persistido após commit")

        return persisted

    except Exception:
        db.rollback()
        raise


def update_project(db: Session, project: Project, payload: ProjectUpdate) -> Project:
    try:
        update_data = payload.model_dump(exclude_unset=True)

        if "title" in update_data and update_data["title"] is not None:
            update_data["title"] = update_data["title"].strip()

        if "description" in update_data and update_data["description"] is not None:
            update_data["description"] = update_data["description"].strip()

        for field, value in update_data.items():
            setattr(project, field, value)

        db.add(project)
        db.commit()
        db.refresh(project)
        return project

    except Exception:
        db.rollback()
        raise


def delete_project(db: Session, project: Project) -> None:
    try:
        db.delete(project)
        db.commit()
    except Exception:
        db.rollback()
        raise
