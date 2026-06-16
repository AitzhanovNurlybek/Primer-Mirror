from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.db.crud import get_company_settings, update_company_settings
from app.db.database import get_db
from app.schemas.company import CompanyInfo, CompanyUpdate

router = APIRouter(tags=["company"])


@router.get("/api/company", response_model=CompanyInfo)
def get_company_info(db: Session = Depends(get_db)) -> CompanyInfo:
    return CompanyInfo.model_validate(get_company_settings(db))


@router.put(
    "/api/admin/company",
    response_model=CompanyInfo,
    dependencies=[Depends(require_admin)],
)
def update_company_info(update: CompanyUpdate, db: Session = Depends(get_db)) -> CompanyInfo:
    values = update.model_dump(exclude_unset=True, exclude_none=True)
    return CompanyInfo.model_validate(update_company_settings(db, values))
