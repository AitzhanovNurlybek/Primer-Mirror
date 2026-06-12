from app.db.models import PricingSettings
from app.schemas.calculator import CalculatorRequest


def calculate_price(request: CalculatorRequest, pricing: PricingSettings) -> float:
    area_m2 = (request.width_mm / 1000) * (request.height_mm / 1000)
    perimeter_m = 2 * (request.width_mm + request.height_mm) / 1000

    price = area_m2 * pricing.price_per_m2
    price += perimeter_m * pricing.edge_processing_per_m

    if request.with_lighting:
        price += perimeter_m * pricing.lighting_per_m

    if request.with_frame:
        price += perimeter_m * pricing.frame_per_m

    price = max(price, pricing.min_order_price)
    total = price * request.quantity

    return round(total, -1)
