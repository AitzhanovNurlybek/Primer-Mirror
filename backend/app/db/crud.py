from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import CompanySettings, Lead, PricingSettings, Work

PRICING_ROW_ID = 1
COMPANY_ROW_ID = 1


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


# --- Company settings (seeded from .env on first run, editable in admin) ---

def get_company_settings(db: Session) -> CompanySettings:
    company = db.get(CompanySettings, COMPANY_ROW_ID)
    if company is None:
        company = CompanySettings(
            id=COMPANY_ROW_ID,
            name=settings.company_name,
            phone=settings.phone,
            whatsapp=settings.whatsapp,
            instagram=settings.instagram,
            kaspi_shop_url=settings.kaspi_shop_url,
        )
        db.add(company)
        db.commit()
        db.refresh(company)
    return company


def update_company_settings(db: Session, values: dict[str, str]) -> CompanySettings:
    company = get_company_settings(db)
    for key, value in values.items():
        setattr(company, key, value)
    db.commit()
    db.refresh(company)
    return company


# --- Leads ---

def create_lead(db: Session, data: dict) -> Lead:
    lead = Lead(**data)
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


def list_leads(db: Session) -> list[Lead]:
    return list(db.scalars(select(Lead).order_by(Lead.created_at.desc())))


def update_lead_status(db: Session, lead_id: int, new_status: str) -> Lead | None:
    lead = db.get(Lead, lead_id)
    if lead is None:
        return None
    lead.status = new_status
    db.commit()
    db.refresh(lead)
    return lead


def delete_lead(db: Session, lead_id: int) -> bool:
    lead = db.get(Lead, lead_id)
    if lead is None:
        return False
    db.delete(lead)
    db.commit()
    return True


# --- Works (portfolio) ---

def list_works(db: Session) -> list[Work]:
    return list(db.scalars(select(Work).order_by(Work.sort_order, Work.id)))


def create_work(db: Session, data: dict) -> Work:
    work = Work(**data)
    db.add(work)
    db.commit()
    db.refresh(work)
    return work


def update_work(db: Session, work_id: int, values: dict) -> Work | None:
    work = db.get(Work, work_id)
    if work is None:
        return None
    for key, value in values.items():
        setattr(work, key, value)
    db.commit()
    db.refresh(work)
    return work


def delete_work(db: Session, work_id: int) -> bool:
    work = db.get(Work, work_id)
    if work is None:
        return False
    db.delete(work)
    db.commit()
    return True
