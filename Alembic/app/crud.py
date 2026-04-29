# app/crud.py
# Soft delete logic:
# - delete_user()  → sirf deleted_at set karta hai, DB se nahi hatata
# - restore_user() → deleted_at wapas None karta hai
# - purge_old_deleted_users() → 30 din purane records permanently delete karta hai

from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timezone, timedelta
from app.models.user import User
from app.schemas import UserCreate, UserUpdate


# ── READ ───────────────────────────────────────────────────────────────────────

def get_user(db: Session, user_id: int):
    # Sirf active users (deleted_at = None)
    return db.query(User).filter(
        User.id == user_id,
        User.deleted_at == None
    ).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(
        User.email == email,
        User.deleted_at == None
    ).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    # Sirf active users return karo
    return db.query(User).filter(
        User.deleted_at == None
    ).offset(skip).limit(limit).all()

def get_deleted_users(db: Session, skip: int = 0, limit: int = 100):
    # Sirf soft-deleted users return karo
    return db.query(User).filter(
        User.deleted_at != None
    ).offset(skip).limit(limit).all()


# ── CREATE ─────────────────────────────────────────────────────────────────────

def create_user(db: Session, user: UserCreate):
    db_user = User(
        name=user.name,
        email=user.email,
        phone=user.phone
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# ── UPDATE ─────────────────────────────────────────────────────────────────────

def update_user(db: Session, user_id: int, user: UserUpdate):
    db_user = db.query(User).filter(
        User.id == user_id,
        User.deleted_at == None
    ).first()
    if not db_user:
        return None
    update_data = user.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user


# ── SOFT DELETE ────────────────────────────────────────────────────────────────

def delete_user(db: Session, user_id: int):
    """Soft delete — sirf deleted_at timestamp set karta hai"""
    db_user = db.query(User).filter(
        User.id == user_id,
        User.deleted_at == None
    ).first()
    if not db_user:
        return None
    db_user.deleted_at = datetime.now(timezone.utc)  # timestamp set karo
    db.commit()
    db.refresh(db_user)
    return db_user


# ── RESTORE ────────────────────────────────────────────────────────────────────

def restore_user(db: Session, user_id: int):
    """Soft deleted user ko wapas active karo"""
    db_user = db.query(User).filter(
        User.id == user_id,
        User.deleted_at != None
    ).first()
    if not db_user:
        return None
    db_user.deleted_at = None  # wapas active
    db.commit()
    db.refresh(db_user)
    return db_user


# ── PERMANENT DELETE (30 din baad auto) ───────────────────────────────────────

def purge_old_deleted_users(db: Session):
    """30 din se zyada purane soft-deleted records permanently delete karo"""
    cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    old_records = db.query(User).filter(
        and_(
            User.deleted_at != None,
            User.deleted_at <= cutoff
        )
    ).all()

    count = len(old_records)
    for user in old_records:
        db.delete(user)
    db.commit()

    return count  # kitne delete hue ye return karo