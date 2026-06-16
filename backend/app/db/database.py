from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

SQLITE_FALLBACK = "sqlite:///./app/data/app.db"


def _resolve_database_url() -> str:
    raw = (settings.database_url or "").strip()

    # An unresolved Railway reference ("${{Postgres.DATABASE_URL}}") or an empty
    # value would crash SQLAlchemy — fall back to SQLite and warn loudly instead.
    if not raw or raw.startswith("${{") or "://" not in raw:
        print(
            f"[db] WARNING: DATABASE_URL is not a valid URL (got {raw!r}). "
            "Falling back to SQLite — data will NOT persist across redeploys. "
            "Fix DATABASE_URL to point at your Postgres service.",
            flush=True,
        )
        return SQLITE_FALLBACK

    # Railway/Heroku may hand out "postgres://", but SQLAlchemy wants "postgresql://".
    if raw.startswith("postgres://"):
        raw = raw.replace("postgres://", "postgresql://", 1)

    print(f"[db] using {raw.split('://', 1)[0]}:// database", flush=True)
    return raw


def _make_engine():
    url = _resolve_database_url()
    # connect_timeout keeps an unreachable Postgres from hanging startup (-> 502).
    args = {"check_same_thread": False} if url.startswith("sqlite") else {"connect_timeout": 5}
    eng = create_engine(url, connect_args=args, pool_pre_ping=True)

    # If a real (non-SQLite) DB is configured but unreachable, fall back to
    # SQLite so the app still boots instead of crash-looping with 502s.
    if not url.startswith("sqlite"):
        try:
            with eng.connect():
                pass
        except Exception as exc:  # noqa: BLE001
            print(
                f"[db] ERROR: cannot connect to database ({exc!r}); "
                "falling back to SQLite. Check that the Postgres service is linked "
                "and DATABASE_URL points to it.",
                flush=True,
            )
            eng.dispose()
            eng = create_engine(SQLITE_FALLBACK, connect_args={"check_same_thread": False})
    return eng


engine = _make_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_columns() -> None:
    """Add new columns to existing tables without dropping data (lightweight migration)."""
    from sqlalchemy import inspect, text

    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    # leads.shape — added after the table already existed in some installs
    if "leads" in existing_tables:
        lead_columns = {col["name"] for col in inspector.get_columns("leads")}
        if "shape" not in lead_columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE leads ADD COLUMN shape VARCHAR(20)"))
