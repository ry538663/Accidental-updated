import time
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from .config import MONGODB_URI, MONGO_DB_NAME


def get_mongo_client(retries: int = 3, wait: float = 2.0) -> MongoClient:
    """Return a connected MongoClient with simple retry logic."""
    if not MONGODB_URI:
        raise RuntimeError("MONGODB_URI not configured")

    last_exc = None
    for attempt in range(1, retries + 1):
        try:
            client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
            # force connection on a request as the connect=True parameter
            client.admin.command('ping')
            return client
        except ServerSelectionTimeoutError as e:
            last_exc = e
            if attempt < retries:
                time.sleep(wait)
    raise last_exc


def get_db():
    client = get_mongo_client()
    # prefer default database from URI, else fallback to configured name
    try:
        db = client.get_default_database()
        if db and db.name:
            return db
    except Exception:
        pass

    return client[MONGO_DB_NAME]
