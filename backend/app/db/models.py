from sqlalchemy import Float, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class PricingSettings(Base):
    __tablename__ = "pricing_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    price_per_m2: Mapped[float] = mapped_column(Float, nullable=False)
    edge_processing_per_m: Mapped[float] = mapped_column(Float, nullable=False)
    lighting_per_m: Mapped[float] = mapped_column(Float, nullable=False)
    frame_per_m: Mapped[float] = mapped_column(Float, nullable=False)
    min_order_price: Mapped[float] = mapped_column(Float, nullable=False)
