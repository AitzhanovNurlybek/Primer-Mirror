from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class PricingSettings(Base):
    __tablename__ = "pricing_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    price_per_m2: Mapped[float] = mapped_column(Float, nullable=False)
    edge_processing_per_m: Mapped[float] = mapped_column(Float, nullable=False)
    lighting_per_m: Mapped[float] = mapped_column(Float, nullable=False)
    frame_per_m: Mapped[float] = mapped_column(Float, nullable=False)
    min_order_price: Mapped[float] = mapped_column(Float, nullable=False)


class CompanySettings(Base):
    __tablename__ = "company_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    whatsapp: Mapped[str] = mapped_column(String(50), nullable=False)
    instagram: Mapped[str] = mapped_column(String(300), nullable=False)
    kaspi_shop_url: Mapped[str] = mapped_column(String(300), nullable=False)


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    width_mm: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height_mm: Mapped[int | None] = mapped_column(Integer, nullable=True)
    quantity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    shape: Mapped[str | None] = mapped_column(String(20), nullable=True)
    with_lighting: Mapped[bool] = mapped_column(Boolean, default=False)
    with_frame: Mapped[bool] = mapped_column(Boolean, default=False)
    frame_color: Mapped[str | None] = mapped_column(String(50), nullable=True)
    total_price: Mapped[float | None] = mapped_column(Float, nullable=True)

    status: Mapped[str] = mapped_column(String(20), default="new", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class Work(Base):
    __tablename__ = "works"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    image: Mapped[str] = mapped_column(Text, nullable=False)  # URL or base64 data URL
    caption: Mapped[str] = mapped_column(String(200), default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class CatalogItem(Base):
    __tablename__ = "catalog_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    brand: Mapped[str | None] = mapped_column(String(120), nullable=True)
    width_cm: Mapped[int] = mapped_column(Integer, nullable=False)
    height_cm: Mapped[int] = mapped_column(Integer, nullable=False)
    is_smart: Mapped[bool] = mapped_column(Boolean, default=False)
    is_led: Mapped[bool] = mapped_column(Boolean, default=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    image: Mapped[str] = mapped_column(Text, nullable=False)
    kaspi_url: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
