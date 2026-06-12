from pydantic import BaseModel


class CompanyInfo(BaseModel):
    name: str
    phone: str
    whatsapp: str
    instagram: str
    kaspi_shop_url: str
