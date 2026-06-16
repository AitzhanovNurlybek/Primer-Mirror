from datetime import datetime

from pydantic import BaseModel, Field


class CatalogItemSchema(BaseModel):
    id: int
    name: str
    brand: str | None
    width_cm: int
    height_cm: int
    is_smart: bool
    is_led: bool
    price: float
    image: str
    kaspi_url: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CatalogItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    brand: str | None = Field(default=None, max_length=120)
    width_cm: int = Field(gt=0, le=1000)
    height_cm: int = Field(gt=0, le=1000)
    is_smart: bool = False
    is_led: bool = False
    price: float = Field(ge=0)
    image: str = Field(min_length=1)
    kaspi_url: str = Field(min_length=1)


class CatalogBrand(BaseModel):
    brand: str
    count: int
