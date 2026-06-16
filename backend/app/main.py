from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import json
from pathlib import Path

from app.api.admin import router as admin_router
from app.api.calculator import router as calculator_router
from app.api.catalog import router as catalog_router
from app.api.company import router as company_router
from app.api.leads import router as leads_router
from app.api.works import router as works_router
from app.core.config import settings
from app.db.crud import bulk_replace_catalog, count_catalog
from app.db.database import Base, SessionLocal, engine, ensure_columns
from app.services.catalog_parser import parse_product

PRODUCTS_SEED = Path(__file__).resolve().parent / "data" / "products.json"


def seed_catalog_if_empty() -> None:
    """On first run, fill the catalog from the bundled products.json."""
    if not PRODUCTS_SEED.exists():
        return
    db = SessionLocal()
    try:
        if count_catalog(db) > 0:
            return
        raw = json.loads(PRODUCTS_SEED.read_text(encoding="utf-8"))
        parsed = [p for p in (parse_product(r) for r in raw) if p]
        if parsed:
            bulk_replace_catalog(db, parsed)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_columns()
    seed_catalog_if_empty()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    # Accept any local dev port (5173, 5174, 5176, ...) so CORS never blocks dev
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calculator_router)
app.include_router(admin_router)
app.include_router(company_router)
app.include_router(leads_router)
app.include_router(works_router)
app.include_router(catalog_router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
