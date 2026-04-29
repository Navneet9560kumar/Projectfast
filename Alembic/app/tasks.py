# Background tasks for automatic cleanup
# Ye file scheduled jobs ke liye hai

from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import logging
from app.db.session import SessionLocal
from app import crud

logger = logging.getLogger(__name__)

def cleanup_soft_deleted_users():
    """
    Background job jo har din chalega aur 30+ days purane soft-deleted users ko delete karega
    """
    db = SessionLocal()
    try:
        deleted_count = crud.delete_permanently_after_30_days(db)
        logger.info(f"[{datetime.utcnow()}] Cleanup job executed. {deleted_count} users permanently deleted.")
    except Exception as e:
        logger.error(f"Error in cleanup job: {str(e)}")
    finally:
        db.close()

def start_scheduler():
    """
    Background scheduler start karo
    Ye app startup pe call hoga
    """
    scheduler = BackgroundScheduler()
    
    # Cleanup job har din midnight (00:00) pe chalega
    scheduler.add_job(
        cleanup_soft_deleted_users,
        'cron',
        hour=0,
        minute=0,
        id='cleanup_soft_deleted_users'
    )
    
    scheduler.start()
    logger.info("Background scheduler started")
    return scheduler

# Alternative: Simple job jo har 24 hours ke baad chalega
def start_simple_scheduler():
    """
    Simple scheduler - har 24 hours ke baad cleanup karo
    """
    scheduler = BackgroundScheduler()
    
    scheduler.add_job(
        cleanup_soft_deleted_users,
        'interval',
        hours=24,
        id='cleanup_soft_deleted_users'
    )
    
    scheduler.start()
    logger.info("Simple background scheduler started (runs every 24 hours)")
    return scheduler
