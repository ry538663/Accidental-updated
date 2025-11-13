"""
MongoDB migration runner for Map + Hospital services
Connects to MongoDB and sets up all collections and indexes programmatically
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timezone
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError

# Get the root directory of the project
project_root = Path(__file__).parent.parent

# Load .env.local first (if it exists) for production secrets
env_local_path = project_root / '.env.local'
if env_local_path.exists():
    load_dotenv(dotenv_path=env_local_path, override=True)
    print(f"[INFO] Loaded from: {env_local_path}")
else:
    # Fallback to .env
    env_path = project_root / '.env'
    if env_path.exists():
        load_dotenv(dotenv_path=env_path, override=True)
        print(f"[INFO] Loaded from: {env_path}")
    else:
        print("[ERROR] Neither .env nor .env.local found")
        sys.exit(1)

MONGODB_URI = os.getenv('MONGODB_URI')

if not MONGODB_URI:
    print("ERROR: MONGODB_URI not set in .env or .env.local")
    print(f"DEBUG: Current working directory: {os.getcwd()}")
    print(f"DEBUG: Project root: {project_root}")
    print(f"DEBUG: Looking for .env.local at: {env_local_path}")
    print(f"DEBUG: .env.local exists: {env_local_path.exists()}")
    sys.exit(1)
else:
    print(f"[INFO] MONGODB_URI found: {MONGODB_URI[:50]}...")

def migrate_mongodb():
    """Create collections and indexes"""
    
    # MongoDB Atlas URIs don't always have a default database in the connection string
    # We need to specify it explicitly or extract it from the URI
    client = MongoClient(MONGODB_URI)
    
    # Try to get default database, if not available use 'Hospital' (from the appName)
    try:
        db = client.get_default_database()
    except Exception:
        print("[INFO] No default database in URI, using 'Hospital'")
        db = client['Hospital']
    
    print("=" * 60)
    print("MongoDB Migration Starting...")
    print("=" * 60)
    
    try:
        # ===== MAP SERVICE COLLECTIONS =====
        print("\n[MAP SERVICE]")
        
        # 1. ambulance_live_logs
        print("Creating collection: ambulance_live_logs")
        if 'ambulance_live_logs' not in db.list_collection_names():
            db.create_collection('ambulance_live_logs')
            db.ambulance_live_logs.insert_one({
                "ambulance_id": "AMB-101",
                "timestamp": datetime.now(timezone.utc),
                "location": {"type": "Point", "coordinates": [80.9967, 26.8893]},
                "speed": 62.5,
                "fuel": 40,
                "battery": 88
            })
            db.ambulance_live_logs.create_index([("location", "2dsphere")])
            db.ambulance_live_logs.create_index([("ambulance_id", 1), ("timestamp", -1)])
            print("  ✓ ambulance_live_logs created with indexes")
        else:
            print("  ⚠ ambulance_live_logs already exists (skipping)")
            # Ensure indexes exist
            db.ambulance_live_logs.create_index([("location", "2dsphere")])
            db.ambulance_live_logs.create_index([("ambulance_id", 1), ("timestamp", -1)])
        
        # 2. incident_timeline
        print("Creating collection: incident_timeline")
        if 'incident_timeline' not in db.list_collection_names():
            db.create_collection('incident_timeline')
            db.incident_timeline.insert_one({
                "incident_id": 155,
                "timeline": [
                    {"ts": datetime.now(timezone.utc), "event": "created", "meta": {}}
                ]
            })
            db.incident_timeline.create_index([("incident_id", 1)])
            print("  ✓ incident_timeline created with indexes")
        else:
            print("  ⚠ incident_timeline already exists (skipping)")
            db.incident_timeline.create_index([("incident_id", 1)])
        
        # 3. patient_condition_media
        print("Creating collection: patient_condition_media")
        if 'patient_condition_media' not in db.list_collection_names():
            db.create_collection('patient_condition_media')
            db.patient_condition_media.insert_one({
                "incident_id": 155,
                "media": [
                    {
                        "id": "m1",
                        "type": "image",
                        "storage_url": "s3://bucket/img1.jpg",
                        "uploaded_at": datetime.now(timezone.utc),
                        "size_bytes": 1024000
                    }
                ]
            })
            print("  ✓ patient_condition_media created")
        else:
            print("  ⚠ patient_condition_media already exists (skipping)")
        
        # ===== HOSPITAL SERVICE COLLECTIONS =====
        print("\n[HOSPITAL SERVICE]")
        
        # 4. hospital_event_log
        print("Creating collection: hospital_event_log")
        if 'hospital_event_log' not in db.list_collection_names():
            db.create_collection('hospital_event_log')
            db.hospital_event_log.insert_one({
                "hospital_id": 12,
                "events": [
                    {"ts": datetime.now(timezone.utc), "type": "bed_reserved", "bed_number": "E-14", "incident_id": 155}
                ]
            })
            db.hospital_event_log.create_index([("hospital_id", 1), ("events.ts", 1)])
            print("  ✓ hospital_event_log created with indexes")
        else:
            print("  ⚠ hospital_event_log already exists (skipping)")
            db.hospital_event_log.create_index([("hospital_id", 1), ("events.ts", 1)])
        
        # 5. hospital_alerts
        print("Creating collection: hospital_alerts")
        if 'hospital_alerts' not in db.list_collection_names():
            db.create_collection('hospital_alerts')
            db.hospital_alerts.insert_one({
                "incident_id": 155,
                "alerts": [
                    {"to": "family", "method": "sms", "phone": "+919876543210", "status": "sent", "ts": datetime.now(timezone.utc)}
                ]
            })
            db.hospital_alerts.create_index([("incident_id", 1)])
            print("  ✓ hospital_alerts created with indexes")
        else:
            print("  ⚠ hospital_alerts already exists (skipping)")
        
        print("\n" + "=" * 60)
        print("Migration completed successfully! ✓")
        print("=" * 60)
        
        # Display database info
        print(f"\nDatabase: {db.name}")
        print(f"Collections: {db.list_collection_names()}")
        print(f"Total collections: {len(db.list_collection_names())}")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        client.close()
        print("\nConnection closed.")

if __name__ == "__main__":
    migrate_mongodb()
