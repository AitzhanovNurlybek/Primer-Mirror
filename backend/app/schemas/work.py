from datetime import datetime

from pydantic import BaseModel, Field


class WorkCreate(BaseModel):
    image: str = Field(min_length=1)  # URL or base64 data URL
    caption: str = Field(default="", max_length=200)
    sort_order: int = 0


class WorkUpdate(BaseModel):
    image: str | None = Field(default=None, min_length=1)
    caption: str | None = Field(default=None, max_length=200)
    sort_order: int | None = None


class WorkSchema(BaseModel):
    id: int
    image: str
    caption: str
    sort_order: int
    created_at: datetime

    model_config = {"from_attributes": True}
