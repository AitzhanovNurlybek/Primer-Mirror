from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import PricingSettings

PRICING_ROW_ID = 1


def get_pricing_settings(db: Session) -> PricingSettings:
    pricing = db.get(PricingSettings, PRICING_ROW_ID)
    if pricing is None:
        pricing = PricingSettings(
            id=PRICING_ROW_ID,
            price_per_m2=settings.default_price_per_m2,
            edge_processing_per_m=settings.default_edge_processing_per_m,
            lighting_per_m=settings.default_lighting_per_m,
            frame_per_m=settings.default_frame_per_m,
            min_order_price=settings.default_min_order_price,
        )
        db.add(pricing)
        db.commit()
        db.refresh(pricing)
    return pricing


def update_pricing_settings(db: Session, values: dict[str, float]) -> PricingSettings:
    pricing = get_pricing_settings(db)
    for key, value in values.items():
        setattr(pricing, key, value)
    db.commit()
    db.refresh(pricing)
    return pricing
