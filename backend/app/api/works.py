from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.db.crud import create_work, delete_work, list_works, update_work
from app.db.database import get_db
from app.schemas.work import WorkCreate, WorkSchema, WorkUpdate

router = APIRouter(tags=["works"])


@router.get("/api/works", response_model=list[WorkSchema])
def read_works(db: Session = Depends(get_db)) -> list[WorkSchema]:
    return [WorkSchema.model_validate(work) for work in list_works(db)]


@router.post(
    "/api/admin/works",
    response_model=WorkSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def add_work(payload: WorkCreate, db: Session = Depends(get_db)) -> WorkSchema:
    return WorkSchema.model_validate(create_work(db, payload.model_dump()))


@router.put(
    "/api/admin/works/{work_id}",
    response_model=WorkSchema,
    dependencies=[Depends(require_admin)],
)
def edit_work(work_id: int, update: WorkUpdate, db: Session = Depends(get_db)) -> WorkSchema:
    values = update.model_dump(exclude_unset=True, exclude_none=True)
    work = update_work(db, work_id, values)
    if work is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")
    return WorkSchema.model_validate(work)


@router.delete(
    "/api/admin/works/{work_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def remove_work(work_id: int, db: Session = Depends(get_db)) -> None:
    if not delete_work(db, work_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")
