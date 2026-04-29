# Ye Alembic ka env.py hai
# Alembic isko use karta hai ye jaanne ke liye ki:
# 1. Database kahan hai (.env se URL leta hai)
# 2. Kaunse models migrate karne hain (Base.metadata)

from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys

from dotenv import load_dotenv
load_dotenv()

# Project root ko path mein add karo taaki app import ho sake
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Apne models import karo — naya model banega toh yahan add karna
from app.db.base import Base
from app.models.user import User  # har naye model ko yahan import karo

config = context.config

# .env se DATABASE_URL le lo
config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Ye Alembic ko batata hai ki kaunse tables track karne hain
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()