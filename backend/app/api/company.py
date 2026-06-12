from fastapi import APIRouter

from app.core.config import settings
from app.schemas.company import CompanyInfo

router = APIRouter(prefix="/api/company", tags=["company"])


@router.get("", response_model=CompanyInfo)
def get_company_info() -> CompanyInfo:
    return CompanyInfo(
        name=settings.company_name,
        phone=settings.phone,
        whatsapp=settings.whatsapp,
        instagram=settings.instagram,
        kaspi_shop_url=settings.kaspi_shop_url,
    )
