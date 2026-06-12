from pydantic import BaseModel, Field


class CalculatorRequest(BaseModel):
    width_mm: int = Field(gt=0, le=6000)
    height_mm: int = Field(gt=0, le=6000)
    quantity: int = Field(default=1, gt=0, le=1000)
    with_lighting: bool = False
    with_frame: bool = False
    frame_color: str | None = None


class CalculatorResponse(BaseModel):
    total_price: float
    currency: str = "KZT"
