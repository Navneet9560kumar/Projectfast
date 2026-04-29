# app/main.py
# APScheduler use kiya hai — ye background mein har roz chalega
# aur 30 din purane soft-deleted records automatically purge karega

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler

from app.db.session import get_db, SessionLocal
from app import crud, schemas

#  BACKGROUND SCHEDULER SETUP 

def auto_purge_job():
    """Ye function har roz chalega — 30 din purane deleted records hatata hai"""
    db = SessionLocal()
    try:
        count = crud.purge_old_deleted_users(db)
        print(f"[Auto Purge] {count} old deleted users permanently removed.")
    finally:
        db.close()

scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # API start hote hi scheduler chalu karo
    scheduler.add_job(auto_purge_job, "interval", hours=24)  # har 24 ghante
    scheduler.start()
    print("[Scheduler] Auto-purge job started — runs every 24 hours.")
    yield
    # API band hote hi scheduler band karo
    scheduler.shutdown()

#  FASTAPI APP 

app = FastAPI(
    title="FastAPI + PostgreSQL + Soft Delete",
    version="1.0.0",
    lifespan=lifespan
)

#  CORS MIDDLEWARE 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "https://projectfast-q9v2.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#  HEALTH CHECK 
@app.get("/")
def root():
    return {"message": "API is running with soft delete + auto purge!"}


#  CREATE USER 
@app.post("/users/", response_model=schemas.UserResponse, status_code=201)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, email=user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)


#  GET ALL ACTIVE USERS 
@app.get("/users/", response_model=List[schemas.UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)


#  GET SOFT DELETED USERS 
@app.get("/users/deleted/", response_model=List[schemas.UserResponse])
def read_deleted_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Soft deleted users dekho — jo 30 din mein permanently delete honge"""
    return crud.get_deleted_users(db, skip=skip, limit=limit)


#  GET ONE USER 
@app.get("/users/{user_id}", response_model=schemas.UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


#  UPDATE USER 
@app.put("/users/{user_id}/", response_model=schemas.UserResponse)
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = crud.update_user(db, user_id=user_id, user=user)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


#  SOFT DELETE USER 
@app.delete("/users/{user_id}/", response_model=schemas.UserResponse)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Soft delete — user 30 din baad automatically permanently delete hoga"""
    db_user = crud.delete_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found or already deleted")
    return db_user


#  RESTORE USER 
@app.post("/users/{user_id}/restore/", response_model=schemas.UserResponse)
def restore_user(user_id: int, db: Session = Depends(get_db)):
    """Soft deleted user ko wapas active karo (30 din ke andar)"""
    db_user = crud.restore_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found or not deleted")
    return db_user


#  MANUAL PURGE (testing ke liye) 
@app.delete("/admin/purge", tags=["Admin"])
def manual_purge(db: Session = Depends(get_db)):
    """Manually 30 din purane deleted records hatao (testing/admin ke liye)"""
    count = crud.purge_old_deleted_users(db)
    return {"message": f"{count} old deleted users permanently removed."}