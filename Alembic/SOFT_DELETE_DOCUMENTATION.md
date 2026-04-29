# Soft Delete Implementation - Documentation

## Overview
Soft delete functionality has been added to your FastAPI application. Users can be marked as deleted instead of permanently removing them from the database. After 30 days, soft-deleted users are automatically permanently deleted.

## Key Features

### 1. **Soft Delete (Mark as Deleted)**
- User data remains in database but is marked as deleted
- `is_deleted` flag is set to `True`
- `deleted_at` timestamp is recorded
- Soft-deleted users don't appear in normal queries
- User can be restored within 30 days

### 2. **Automatic Cleanup After 30 Days**
- Background scheduler runs every 24 hours
- Users soft-deleted 30+ days ago are permanently removed
- No manual intervention needed

### 3. **User Restoration**
- Soft-deleted users can be restored before the 30-day window closes
- Restores `is_deleted` to `False` and clears `deleted_at`

## Database Changes

### New Columns Added to `users` table:
```sql
is_deleted BOOLEAN NOT NULL DEFAULT false
deleted_at TIMESTAMP WITH TIMEZONE NULL
```

### Migration File:
`alembic/versions/soft_delete_implementation.py`

## API Endpoints

### 1. **Soft Delete User** (Recommended)
```
DELETE /users/{user_id}/soft
```
- Mark user as deleted
- Data preserved for 30 days
- Response includes `is_deleted: true` and `deleted_at` timestamp

**Example:**
```bash
curl -X DELETE http://localhost:8000/users/1/soft
```

### 2. **Restore Soft-Deleted User**
```
POST /users/{user_id}/restore
```
- Restore a soft-deleted user
- Only works if user was soft deleted (not yet permanently removed)

**Example:**
```bash
curl -X POST http://localhost:8000/users/1/restore
```

### 3. **Hard Delete User** (Immediate Permanent Deletion)
```
DELETE /users/{user_id}
```
- Immediately and permanently delete user from database
- No restoration possible
- Use with caution!

**Example:**
```bash
curl -X DELETE http://localhost:8000/users/1
```

### 4. **Get Soft-Deleted Users** (Admin Only)
```
GET /admin/users/deleted
```
- View all soft-deleted users
- Supports pagination with `skip` and `limit` parameters

**Example:**
```bash
curl http://localhost:8000/admin/users/deleted?skip=0&limit=10
```

### 5. **Manual Cleanup Trigger** (Admin)
```
POST /admin/cleanup/delete-after-30-days
```
- Manually trigger permanent deletion of 30+ day old soft-deleted users
- Normally runs automatically every 24 hours via background scheduler

**Example:**
```bash
curl -X POST http://localhost:8000/admin/cleanup/delete-after-30-days
```

## Code Changes Summary

### Model Changes (`app/models/user.py`)
```python
is_deleted = Column(Boolean, default=False, nullable=False)
deleted_at = Column(DateTime(timezone=True), nullable=True)
```

### CRUD Functions (`app/crud.py`)
- **`soft_delete_user()`** - Mark user as deleted
- **`restore_user()`** - Restore soft-deleted user
- **`delete_permanently_after_30_days()`** - Permanent deletion of old records
- **`get_soft_deleted_users()`** - Retrieve soft-deleted users
- All read functions now filter out soft-deleted records by default

### Background Scheduler (`app/tasks.py`)
- Runs every 24 hours
- Automatically deletes users soft-deleted 30+ days ago
- Logging enabled for monitoring

### Requirements
- Added `apscheduler` to `requirements.txt`

## Installation Steps

1. **Install new dependency:**
```bash
pip install apscheduler
```

2. **Run the migration:**
```bash
alembic upgrade head
```

3. **Restart your application:**
```bash
uvicorn app.main:app --reload
```

## Usage Workflow

### Scenario 1: User Wants to Delete Account
```
User → DELETE /users/{id}/soft
→ User marked as deleted
→ Data preserved for 30 days
→ After 30 days: Automatically permanently deleted
```

### Scenario 2: User Changes Mind (Within 30 Days)
```
User → POST /users/{id}/restore
→ User restored to active status
→ Data remains in database
```

### Scenario 3: Admin Force Delete (Immediate)
```
Admin → DELETE /users/{id}
→ User immediately and permanently removed
→ No recovery possible
```

## Monitoring & Maintenance

### Check Soft-Deleted Users
```bash
curl http://localhost:8000/admin/users/deleted
```

### Monitor Cleanup Jobs
Check application logs for messages like:
```
✅ Background scheduler started for soft-delete cleanup
[2026-04-29 12:00:00] Cleanup job executed. 5 users permanently deleted.
```

### Disable Automatic Cleanup (If Needed)
In `app/main.py`, comment out the startup event:
```python
@app.on_event("startup")
def startup_event():
    # global scheduler
    # scheduler = start_simple_scheduler()
    pass
```

## Best Practices

1. **Always use soft delete** for user-initiated deletions
2. **Use hard delete only** for:
   - Admin manual purging
   - Data privacy compliance (GDPR right to forget)
   - System maintenance

3. **Monitor the cleanup job** to ensure it's running correctly
4. **Backup regularly** before permanent deletions
5. **Keep audit logs** of who deleted which users

## Troubleshooting

### Issue: Cleanup job not running
- Check if APScheduler is installed: `pip install apscheduler`
- Check application logs for startup messages
- Ensure app startup event is called

### Issue: Can't restore deleted user
- User may have already been permanently deleted (30+ days passed)
- Check `deleted_at` timestamp to verify

### Issue: Soft-deleted users appearing in queries
- All read functions filter by `is_deleted == False`
- If custom queries used, ensure to add the filter

## Database Query Examples

### Get all active (non-deleted) users
```sql
SELECT * FROM users WHERE is_deleted = FALSE;
```

### Get all soft-deleted users
```sql
SELECT * FROM users WHERE is_deleted = TRUE;
```

### Get users deleted before a specific date
```sql
SELECT * FROM users 
WHERE is_deleted = TRUE 
AND deleted_at <= NOW() - INTERVAL '30 days';
```

### Count soft-deleted users
```sql
SELECT COUNT(*) FROM users WHERE is_deleted = TRUE;
```

---

**Implementation Date:** April 29, 2026  
**Soft Delete Window:** 30 days  
**Automatic Cleanup:** Every 24 hours
