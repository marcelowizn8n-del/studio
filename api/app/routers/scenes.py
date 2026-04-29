from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.scene import SceneCreate, SceneGenerateRequest, SceneRead, SceneUpdate
from app.services import scene_service

router = APIRouter(prefix="/api/v1", tags=["scenes"])


@router.get("/projects/{project_id}/scenes", response_model=list[SceneRead])
def list_project_scenes(project_id: str, db: Session = Depends(get_db)):
    return scene_service.list_scenes(db, project_id)


@router.post("/projects/{project_id}/scenes", response_model=SceneRead, status_code=status.HTTP_201_CREATED)
def create_project_scene(project_id: str, payload: SceneCreate, db: Session = Depends(get_db)):
    return scene_service.create_scene(db, project_id, payload)


@router.post("/projects/{project_id}/scenes/generate", response_model=list[SceneRead])
def generate_project_scenes(project_id: str, payload: SceneGenerateRequest, db: Session = Depends(get_db)):
    return scene_service.generate_scenes(db, project_id, payload)


@router.patch("/scenes/{scene_id}", response_model=SceneRead)
def update_project_scene(scene_id: str, payload: SceneUpdate, db: Session = Depends(get_db)):
    scene = scene_service.get_scene(db, scene_id)
    if scene is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scene not found")
    return scene_service.update_scene(db, scene, payload)


@router.delete("/scenes/{scene_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_scene(scene_id: str, db: Session = Depends(get_db)):
    scene = scene_service.get_scene(db, scene_id)
    if scene is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scene not found")
    scene_service.delete_scene(db, scene)
