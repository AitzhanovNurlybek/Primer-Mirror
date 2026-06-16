from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.db.crud import (
    bulk_replace_catalog,
    catalog_brands,
    catalog_price_stats,
    count_catalog,
    create_catalog_item,
    delete_catalog_item,
    list_catalog,
)
from app.db.database import get_db
from app.schemas.catalog import CatalogBrand, CatalogItemCreate, CatalogItemSchema
from app.services.catalog_parser import parse_product

router = APIRouter(tags=["catalog"])


@router.get("/api/catalog", response_model=list[CatalogItemSchema])
def read_catalog(
    db: Session = Depends(get_db),
    width_cm: int | None = Query(default=None, gt=0),
    height_cm: int | None = Query(default=None, gt=0),
    tolerance: int = Query(default=5, ge=0, le=100),
    brand: str | None = None,
    is_smart: bool | None = None,
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    sort: str = "price_asc",
    limit: int | None = Query(default=None, gt=0, le=500),
) -> list[CatalogItemSchema]:
    items = list_catalog(
        db,
        width_cm=width_cm,
        height_cm=height_cm,
        tolerance=tolerance,
        brand=brand,
        is_smart=is_smart,
        min_price=min_price,
        max_price=max_price,
        sort=sort,
        limit=limit,
    )
    return [CatalogItemSchema.model_validate(item) for item in items]


@router.get("/api/catalog/brands", response_model=list[CatalogBrand])
def read_brands(db: Session = Depends(get_db)) -> list[CatalogBrand]:
    return [CatalogBrand(**b) for b in catalog_brands(db)]


@router.get("/api/catalog/stats")
def read_stats(
    width_cm: int = Query(gt=0),
    height_cm: int = Query(gt=0),
    tolerance: int = Query(default=10, ge=0, le=100),
    db: Session = Depends(get_db),
) -> dict:
    return catalog_price_stats(db, width_cm, height_cm, tolerance)


@router.post(
    "/api/admin/catalog",
    response_model=CatalogItemSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def add_catalog_item(payload: CatalogItemCreate, db: Session = Depends(get_db)) -> CatalogItemSchema:
    return CatalogItemSchema.model_validate(create_catalog_item(db, payload.model_dump()))


@router.post("/api/admin/catalog/import", dependencies=[Depends(require_admin)])
def import_catalog(raw_items: list[dict], db: Session = Depends(get_db)) -> dict:
    """Replace the whole catalog with parsed Kaspi products (the products.json format)."""
    parsed = [p for p in (parse_product(r) for r in raw_items) if p]
    if not parsed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid items")
    count = bulk_replace_catalog(db, parsed)
    skipped = len(raw_items) - count
    return {"imported": count, "skipped": skipped}


@router.delete(
    "/api/admin/catalog/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def remove_catalog_item(item_id: int, db: Session = Depends(get_db)) -> None:
    if not delete_catalog_item(db, item_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")


@router.get("/api/admin/catalog/count", dependencies=[Depends(require_admin)])
def catalog_count(db: Session = Depends(get_db)) -> dict:
    return {"count": count_catalog(db)}
