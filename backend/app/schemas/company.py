from pydantic import BaseModel


class CompanyInfo(BaseModel):
    name: str
    phone: str
    whatsapp: str
    instagram: str
    kaspi_shop_url: str

    model_config = {"from_attributes": True}


class CompanyUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    whatsapp: str | None = None
    instagram: str | None = None
    kaspi_shop_url: str | None = None
