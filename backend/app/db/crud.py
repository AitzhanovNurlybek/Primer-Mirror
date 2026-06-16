from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import CatalogItem, CompanySettings, Lead, PricingSettings, Work

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


# --- Catalog ---

def list_catalog(
    db: Session,
    *,
    width_cm: int | None = None,
    height_cm: int | None = None,
    tolerance: int = 5,
    brand: str | None = None,
    is_smart: bool | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    sort: str = "price_asc",
    limit: int | None = None,
) -> list[CatalogItem]:
    stmt = select(CatalogItem)

    # Match either orientation (W×H or H×W) within a tolerance in cm
    if width_cm is not None and height_cm is not None:
        a, b = width_cm, height_cm
        stmt = stmt.where(
            (
                CatalogItem.width_cm.between(a - tolerance, a + tolerance)
                & CatalogItem.height_cm.between(b - tolerance, b + tolerance)
            )
            | (
                CatalogItem.width_cm.between(b - tolerance, b + tolerance)
                & CatalogItem.height_cm.between(a - tolerance, a + tolerance)
            )
        )

    if brand:
        stmt = stmt.where(CatalogItem.brand == brand)
    if is_smart is not None:
        stmt = stmt.where(CatalogItem.is_smart.is_(is_smart))
    if min_price is not None:
        stmt = stmt.where(CatalogItem.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(CatalogItem.price <= max_price)

    if sort == "price_desc":
        stmt = stmt.order_by(CatalogItem.price.desc())
    elif sort == "size_asc":
        stmt = stmt.order_by(CatalogItem.width_cm * CatalogItem.height_cm)
    elif sort == "size_desc":
        stmt = stmt.order_by((CatalogItem.width_cm * CatalogItem.height_cm).desc())
    else:  # price_asc (default)
        stmt = stmt.order_by(CatalogItem.price)

    if limit:
        stmt = stmt.limit(limit)

    return list(db.scalars(stmt))


def catalog_price_stats(
    db: Session, width_cm: int, height_cm: int, tolerance: int = 10
) -> dict:
    """Price range of ready catalog mirrors near a given size (market reference)."""
    items = list_catalog(db, width_cm=width_cm, height_cm=height_cm, tolerance=tolerance)
    prices = [item.price for item in items]
    if not prices:
        return {"count": 0, "min_price": None, "max_price": None, "avg_price": None}
    return {
        "count": len(prices),
        "min_price": min(prices),
        "max_price": max(prices),
        "avg_price": round(sum(prices) / len(prices)),
    }


def catalog_brands(db: Session) -> list[dict]:
    stmt = (
        select(CatalogItem.brand, func.count(CatalogItem.id))
        .where(CatalogItem.brand.is_not(None))
        .group_by(CatalogItem.brand)
        .order_by(func.count(CatalogItem.id).desc())
    )
    return [{"brand": brand, "count": count} for brand, count in db.execute(stmt) if brand]


def count_catalog(db: Session) -> int:
    return db.scalar(select(func.count(CatalogItem.id))) or 0


def create_catalog_item(db: Session, data: dict) -> CatalogItem:
    item = CatalogItem(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def bulk_replace_catalog(db: Session, items: list[dict]) -> int:
    """Wipe the catalog and insert a fresh set (used by the import)."""
    db.query(CatalogItem).delete()
    db.add_all([CatalogItem(**data) for data in items])
    db.commit()
    return len(items)


def delete_catalog_item(db: Session, item_id: int) -> bool:
    item = db.get(CatalogItem, item_id)
    if item is None:
        return False
    db.delete(item)
    db.commit()
    return True
