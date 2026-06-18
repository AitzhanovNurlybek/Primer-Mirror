import json

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "Primer Mirror API"
    host: str = "0.0.0.0"
    port: int = 8000

    # Kept as a raw string so a malformed value never crashes startup.
    # Accepts: "*", a single URL, a comma-separated list, or a JSON array.
    cors_origins: str = "*"

    database_url: str = "sqlite:///./app/data/app.db"

    # Admin auth
    admin_username: str = "admin"
    admin_password: str = "change-me"
    jwt_secret_key: str = "change-this-secret-key"
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 720

    # Default pricing coefficients (editable later via admin panel)
    default_price_per_m2: float = 25000
    default_edge_processing_per_m: float = 1500
    default_lighting_per_m: float = 4000
    default_frame_per_m: float = 3500
    default_min_order_price: float = 15000

    # Company contacts
    company_name: str = "Primer Mirror"
    phone: str = "+7 747 177 07 61"
    whatsapp: str = "+7 747 177 07 61"
    instagram: str = "https://instagram.com/primer_mirror"
    kaspi_shop_url: str = "https://kaspi.kz/"

    @property
    def cors_origins_list(self) -> list[str]:
        raw = (self.cors_origins or "").strip()
        if not raw:
            return ["*"]
        if raw.startswith("["):
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    return [str(x).strip() for x in parsed if str(x).strip()]
            except json.JSONDecodeError:
                pass
        return [part.strip() for part in raw.split(",") if part.strip()]


settings = Settings()
