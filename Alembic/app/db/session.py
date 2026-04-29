# Ye file PostgreSQL se connection banati hai
# SessionLocal har request ke liye ek DB session deta hai

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
print("Database connection established😎")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Ye function FastAPI ke har route mein DB session deta hai
# Request aate hi session khulta hai, khatam hote hi band ho jata hai
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()