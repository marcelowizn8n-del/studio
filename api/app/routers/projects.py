from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectOut, ProjectUpdate, MessageResponse
from app.schemas.project_briefing import ProjectBriefingCreate, ProjectBriefingOut
from app.schemas.project_story import ProjectStoryGenerateRequest, ProjectStoryOut
from app.schemas.project_image_prompt import ProjectImagePromptGenerateRequest, ProjectImagePromptOut
from app.schemas.project_video_prompt import ProjectVideoPromptGenerateRequest, ProjectVideoPromptOut
from app.schemas.scene import (
    ProjectSceneCreate,
    ProjectSceneGenerateRequest,
    ProjectSceneOut,
    ProjectScenePromptGenerateRequest,
    ProjectSceneUpdate,
)
from app.services.project_service import (
    list_projects,
    get_project_by_id,
    create_project,
    update_project,
    delete_project,
)
from app.services.project_briefing_service import (
    get_briefing_by_project_id,
    create_or_update_briefing,
)
from app.services.project_story_service import (
    get_story_by_project_id,
    generate_or_update_story,
)
from app.services.project_image_prompt_service import (
    get_image_prompts_by_project_id,
    generate_or_update_image_prompts,
)
from app.services.project_video_prompt_service import (
    get_video_prompts_by_project_id,
    generate_or_update_video_prompts,
)
from app.services.scene_service import (
    create_project_scene,
    delete_project_scene,
    generate_image_prompts_for_scenes,
    generate_project_scenes,
    generate_video_prompts_for_scenes,
    get_project_scene,
    list_project_scenes,
    update_project_scene,
)

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


@router.get("", response_model=list[ProjectOut])
def api_list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ProjectOut]:
    return list_projects(db, current_user.id)


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def api_create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectOut:
    return create_project(db, current_user.id, payload)


@router.get("/{project_id}", response_model=ProjectOut)
def api_get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectOut:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return project


@router.patch("/{project_id}", response_model=ProjectOut)
def api_update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectOut:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return update_project(db, project, payload)


@router.delete("/{project_id}", response_model=MessageResponse)
def api_delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    delete_project(db, project)
    return MessageResponse(message="Projeto excluído com sucesso")


@router.get("/{project_id}/briefing", response_model=ProjectBriefingOut)
def api_get_project_briefing(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectBriefingOut:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    briefing = get_briefing_by_project_id(db, project_id)
    if not briefing:
        raise HTTPException(status_code=404, detail="Briefing não encontrado")

    return briefing


@router.post("/{project_id}/briefing", response_model=ProjectBriefingOut)
def api_upsert_project_briefing(
    project_id: int,
    payload: ProjectBriefingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectBriefingOut:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    return create_or_update_briefing(db, project_id, payload)


@router.get("/{project_id}/story", response_model=ProjectStoryOut)
def api_get_project_story(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectStoryOut:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    story = get_story_by_project_id(db, project_id)
    if not story:
        raise HTTPException(status_code=404, detail="História não encontrada")

    return story


@router.post("/{project_id}/story/generate", response_model=ProjectStoryOut)
def api_generate_project_story(
    project_id: int,
    payload: ProjectStoryGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectStoryOut:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    try:
        return generate_or_update_story(
            db,
            project_id=project_id,
            force_regenerate=payload.force_regenerate,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/{project_id}/image-prompts", response_model=ProjectImagePromptOut)
def api_get_project_image_prompts(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectImagePromptOut:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    prompts = get_image_prompts_by_project_id(db, project_id)
    if not prompts:
        raise HTTPException(status_code=404, detail="Prompts de imagem não encontrados")

    return prompts


@router.post("/{project_id}/image-prompts/generate", response_model=ProjectImagePromptOut)
def api_generate_project_image_prompts(
    project_id: int,
    payload: ProjectImagePromptGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectImagePromptOut:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    try:
        return generate_or_update_image_prompts(
            db,
            project_id=project_id,
            force_regenerate=payload.force_regenerate,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/{project_id}/video-prompts", response_model=ProjectVideoPromptOut)
def api_get_project_video_prompts(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectVideoPromptOut:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    prompts = get_video_prompts_by_project_id(db, project_id)
    if not prompts:
        raise HTTPException(status_code=404, detail="Prompts de vídeo não encontrados")

    return prompts


@router.post("/{project_id}/video-prompts/generate", response_model=ProjectVideoPromptOut)
def api_generate_project_video_prompts(
    project_id: int,
    payload: ProjectVideoPromptGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectVideoPromptOut:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    try:
        return generate_or_update_video_prompts(
            db,
            project_id=project_id,
            force_regenerate=payload.force_regenerate,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/{project_id}/scenes", response_model=list[ProjectSceneOut])
def api_list_project_scenes(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ProjectSceneOut]:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return list_project_scenes(db, project_id)


@router.post("/{project_id}/scenes", response_model=ProjectSceneOut, status_code=status.HTTP_201_CREATED)
def api_create_project_scene(
    project_id: int,
    payload: ProjectSceneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectSceneOut:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return create_project_scene(db, project_id, payload)


@router.post("/{project_id}/scenes/generate", response_model=list[ProjectSceneOut])
def api_generate_project_scenes(
    project_id: int,
    payload: ProjectSceneGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ProjectSceneOut]:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    try:
        return generate_project_scenes(
            db,
            project_id=project_id,
            scene_count=payload.scene_count,
            force_regenerate=payload.force_regenerate,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/{project_id}/scenes/generate-image-prompts", response_model=list[ProjectSceneOut])
def api_generate_project_scene_image_prompts(
    project_id: int,
    payload: ProjectScenePromptGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ProjectSceneOut]:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    try:
        return generate_image_prompts_for_scenes(
            db,
            project_id=project_id,
            force_regenerate=payload.force_regenerate,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/{project_id}/scenes/generate-video-prompts", response_model=list[ProjectSceneOut])
def api_generate_project_scene_video_prompts(
    project_id: int,
    payload: ProjectScenePromptGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ProjectSceneOut]:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    try:
        return generate_video_prompts_for_scenes(
            db,
            project_id=project_id,
            force_regenerate=payload.force_regenerate,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.patch("/{project_id}/scenes/{scene_id}", response_model=ProjectSceneOut)
def api_update_project_scene(
    project_id: int,
    scene_id: int,
    payload: ProjectSceneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectSceneOut:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    scene = get_project_scene(db, project_id, scene_id)
    if not scene:
        raise HTTPException(status_code=404, detail="Cena não encontrada")

    return update_project_scene(db, scene, payload)


@router.delete("/{project_id}/scenes/{scene_id}", response_model=MessageResponse)
def api_delete_project_scene(
    project_id: int,
    scene_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    scene = get_project_scene(db, project_id, scene_id)
    if not scene:
        raise HTTPException(status_code=404, detail="Cena não encontrada")

    delete_project_scene(db, scene)
    return MessageResponse(message="Cena excluída com sucesso")
