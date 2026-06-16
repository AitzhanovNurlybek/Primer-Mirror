from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

LeadStatus = Literal["new", "in_progress", "done"]


class LeadCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    phone: str = Field(min_length=3, max_length=50)
    comment: str | None = Field(default=None, max_length=2000)

    width_mm: int | None = Field(default=None, gt=0, le=6000)
    height_mm: int | None = Field(default=None, gt=0, le=6000)
    quantity: int | None = Field(default=None, gt=0, le=1000)
    shape: str | None = None
    with_lighting: bool = False
    with_frame: bool = False
    frame_color: str | None = None
    total_price: float | None = Field(default=None, ge=0)


class LeadSchema(BaseModel):
    id: int
    name: str
    phone: str
    comment: str | None
    width_mm: int | None
    height_mm: int | None
    quantity: int | None
    shape: str | None
    with_lighting: bool
    with_frame: bool
    frame_color: str | None
    total_price: float | None
    status: LeadStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class LeadStatusUpdate(BaseModel):
    status: LeadStatus
