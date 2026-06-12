from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.crud import get_pricing_settings
from app.db.database import get_db
from app.schemas.calculator import CalculatorRequest, CalculatorResponse
from app.services.pricing_calculator import calculate_price

router = APIRouter(prefix="/api/calculator", tags=["calculator"])


@router.post("/estimate", response_model=CalculatorResponse)
def estimate(request: CalculatorRequest, db: Session = Depends(get_db)) -> CalculatorResponse:
    pricing = get_pricing_settings(db)
    total_price = calculate_price(request, pricing)
    return CalculatorResponse(total_price=total_price)
