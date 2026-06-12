from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, require_admin, verify_admin_credentials
from app.db.crud import get_pricing_settings, update_pricing_settings
from app.db.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.pricing import PricingSettingsSchema, PricingSettingsUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest) -> TokenResponse:
    if not verify_admin_credentials(credentials.username, credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    return TokenResponse(access_token=create_access_token())


@router.get("/pricing", response_model=PricingSettingsSchema, dependencies=[Depends(require_admin)])
def read_pricing(db: Session = Depends(get_db)) -> PricingSettingsSchema:
    return PricingSettingsSchema.model_validate(get_pricing_settings(db))


@router.put("/pricing", response_model=PricingSettingsSchema, dependencies=[Depends(require_admin)])
def write_pricing(update: PricingSettingsUpdate, db: Session = Depends(get_db)) -> PricingSettingsSchema:
    values = update.model_dump(exclude_unset=True)
    return PricingSettingsSchema.model_validate(update_pricing_settings(db, values))
