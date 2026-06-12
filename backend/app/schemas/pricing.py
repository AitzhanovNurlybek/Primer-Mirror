from pydantic import BaseModel, Field


class PricingSettingsSchema(BaseModel):
    price_per_m2: float = Field(ge=0)
    edge_processing_per_m: float = Field(ge=0)
    lighting_per_m: float = Field(ge=0)
    frame_per_m: float = Field(ge=0)
    min_order_price: float = Field(ge=0)

    model_config = {"from_attributes": True}


class PricingSettingsUpdate(BaseModel):
    price_per_m2: float | None = Field(default=None, ge=0)
    edge_processing_per_m: float | None = Field(default=None, ge=0)
    lighting_per_m: float | None = Field(default=None, ge=0)
    frame_per_m: float | None = Field(default=None, ge=0)
    min_order_price: float | None = Field(default=None, ge=0)
