from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

import os

# Normalize SQLite database path relative to backend root if relative
db_url = settings.DATABASE_URL
if db_url.startswith("sqlite:///./"):
    rel_path = db_url.replace("sqlite:///./", "")
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    abs_db_path = os.path.join(backend_dir, rel_path).replace("\\", "/")
    db_url = f"sqlite:///{abs_db_path}"

# In case of MySQL connection, ensure pool_pre_ping is enabled
connect_args = {}
if "sqlite" in db_url:
    connect_args = {"check_same_thread": False}

engine_kwargs = {
    "pool_pre_ping": True,
    "connect_args": connect_args
}
if "sqlite" not in db_url:
    engine_kwargs["pool_recycle"] = 300
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_engine(db_url, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
