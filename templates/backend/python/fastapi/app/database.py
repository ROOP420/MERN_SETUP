"""
Database configuration and session management
Supports both SQL (PostgreSQL, MySQL, SQLite) and MongoDB
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from motor.motor_asyncio import AsyncIOMotorClient
from typing import AsyncGenerator
from app.config import settings

# SQLAlchemy Base
Base = declarative_base()

# SQL Database Engine (for SQLAlchemy)
if settings.DATABASE_TYPE in ["postgresql", "mysql", "sqlite"]:
    # Convert sync database URL to async
    if settings.DATABASE_TYPE == "postgresql":
        database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    elif settings.DATABASE_TYPE == "mysql":
        database_url = settings.DATABASE_URL.replace("mysql://", "mysql+aiomysql://")
    else:  # sqlite
        database_url = settings.DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")
    
    engine = create_async_engine(
        database_url,
        echo=settings.DEBUG,
        future=True
    )
    
    AsyncSessionLocal = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    async def get_db() -> AsyncGenerator[AsyncSession, None]:
        """Dependency for getting async database session"""
        async with AsyncSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

# MongoDB Client
elif settings.DATABASE_TYPE == "mongodb":
    mongodb_client = AsyncIOMotorClient(settings.DATABASE_URL)
    mongodb_database = mongodb_client.get_database()
    
    def get_mongodb():
        """Dependency for getting MongoDB database"""
        return mongodb_database


async def init_db():
    """Initialize database - create tables for SQL databases"""
    if settings.DATABASE_TYPE in ["postgresql", "mysql", "sqlite"]:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    # For MongoDB, collections are created automatically


async def close_db():
    """Close database connections"""
    if settings.DATABASE_TYPE in ["postgresql", "mysql", "sqlite"]:
        await engine.dispose()
    elif settings.DATABASE_TYPE == "mongodb":
        mongodb_client.close()
