from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.db.crud import create_lead, delete_lead, list_leads, update_lead_status
from app.db.database import get_db
from app.schemas.lead import LeadCreate, LeadSchema, LeadStatusUpdate

router = APIRouter(tags=["leads"])


@router.post("/api/leads", response_model=LeadSchema, status_code=status.HTTP_201_CREATED)
def submit_lead(payload: LeadCreate, db: Session = Depends(get_db)) -> LeadSchema:
    lead = create_lead(db, payload.model_dump())
    return LeadSchema.model_validate(lead)


@router.get(
    "/api/admin/leads",
    response_model=list[LeadSchema],
    dependencies=[Depends(require_admin)],
)
def read_leads(db: Session = Depends(get_db)) -> list[LeadSchema]:
    return [LeadSchema.model_validate(lead) for lead in list_leads(db)]


@router.patch(
    "/api/admin/leads/{lead_id}",
    response_model=LeadSchema,
    dependencies=[Depends(require_admin)],
)
def change_lead_status(
    lead_id: int, update: LeadStatusUpdate, db: Session = Depends(get_db)
) -> LeadSchema:
    lead = update_lead_status(db, lead_id, update.status)
    if lead is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return LeadSchema.model_validate(lead)


@router.delete(
    "/api/admin/leads/{lead_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def remove_lead(lead_id: int, db: Session = Depends(get_db)) -> None:
    if not delete_lead(db, lead_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
