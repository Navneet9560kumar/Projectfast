# Ye Base class hai jisse saare models inherit karte hain
# Alembic bhi isko use karta hai migrations ke liye

from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()