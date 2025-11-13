# MongoDB Migration & Access Guide

## What was migrated?

### Map Service Collections (5 collections)

1. **ambulance_live_logs** — Real-time location pings from ambulances
   - Fields: `ambulance_id`, `timestamp`, `location` (GeoJSON), `speed`, `fuel`, `battery`
   - Indexes: 2dsphere (geo), ambulance_id + timestamp
   - Purpose: Track ambulance movement, calculate nearest ambulance to incident

2. **incident_timeline** — Audit log of each incident's lifecycle events
   - Fields: `incident_id`, `timeline[]` (array of events with timestamps)
   - Indexes: incident_id
   - Purpose: Track incident status progression (created → assigned → enroute → arrived)

3. **patient_condition_media** — Media uploads (images, documents, vitals)
   - Fields: `incident_id`, `media[]` (array of file references)
   - Purpose: Store image URLs from S3/MinIO and metadata

### Hospital Service Collections (2 collections)

4. **hospital_event_log** — Events per hospital (bed reservations, staff actions)
   - Fields: `hospital_id`, `events[]` (array of events)
   - Indexes: hospital_id + events.ts
   - Purpose: Audit trail for bed reservations, staff actions

5. **hospital_alerts** — Alert history (SMS/email to family, police)
   - Fields: `incident_id`, `alerts[]` (array of sent alerts)
   - Indexes: incident_id
   - Purpose: Compliance and audit trail for notifications sent

---

## How to Access Your MongoDB Data

### Option 1: MongoDB Compass (GUI) — Easiest for beginners

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Open Compass
3. Click "New Connection"
4. Paste your connection string:
   ```
   mongodb+srv://Hospital_ry:Rohit321@hospital.wabbsrz.mongodb.net/?appName=Hospital
   ```
5. Click "Connect"
6. You'll see your database and collections on the left sidebar

### Option 2: MongoDB Atlas Web UI

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Log in with your account
3. Click your cluster (Hospital)
4. Click "Collections" tab
5. You'll see all 5 collections listed

### Option 3: MongoDB Shell (CLI)

```bash
# Install mongosh if not already installed
# https://www.mongodb.com/try/download/shell

# Connect using your URI
mongosh "mongodb+srv://Hospital_ry:Rohit321@hospital.wabbsrz.mongodb.net/?appName=Hospital"

# List all databases
show databases

# Switch to your database
use Hospital

# List collections
show collections

# Query ambulance logs
db.ambulance_live_logs.find().limit(10)

# Query incident timeline
db.incident_timeline.find()

# Query hospital events
db.hospital_event_log.find()
```

### Option 4: Python (Programmatically)

```python
from pymongo import MongoClient

MONGODB_URI = "mongodb+srv://Hospital_ry:Rohit321@hospital.wabbsrz.mongodb.net/?appName=Hospital"
client = MongoClient(MONGODB_URI)
db = client.get_default_database()

# Get all ambulance logs
logs = db.ambulance_live_logs.find().limit(10)
for log in logs:
    print(log)

# Get incident timeline
timeline = db.incident_timeline.find_one({"incident_id": 155})
print(timeline)

client.close()
```

---

## How to Run the Migration

### Local Machine (Windows)

```bash
# From repo root
migrate.bat
```

### Local Machine (Mac/Linux)

```bash
# From repo root
chmod +x migrate.sh
./migrate.sh
```

### Or manually with Python:

```bash
python backend/migrate_mongodb.py
```

### On Render (after deployment)

1. Log in to Render dashboard
2. Go to your backend service
3. Click "Shell" tab
4. Run:
   ```bash
   python backend/migrate_mongodb.py
   ```

### Or add as pre-deploy hook in `render.yaml`:

```yaml
pre_deploy_command: "python backend/migrate_mongodb.py"
```

---

## Verify Migration Succeeded

After running the migration, check MongoDB Compass or shell:

```bash
# In mongosh
use Hospital
show collections

# Should output:
# ambulance_live_logs
# incident_timeline
# patient_condition_media
# hospital_event_log
# hospital_alerts

# Count documents
db.ambulance_live_logs.countDocuments()    # Should be >= 1
db.incident_timeline.countDocuments()      # Should be >= 1
```

---

## Sample Queries for Your Application

### Find nearest ambulance to incident location

```javascript
db.ambulance_live_logs.findOne({
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates: [80.9967, 26.8893] },
      $maxDistance: 20000  // 20km radius
    }
  }
})
```

### Get incident timeline (audit log)

```javascript
db.incident_timeline.findOne({ incident_id: 155 })
```

### Get hospital events for a specific hospital

```javascript
db.hospital_event_log.findOne({ hospital_id: 12 })
```

### Get all alerts for an incident

```javascript
db.hospital_alerts.findOne({ incident_id: 155 })
```

---

## Connection String Reference

Your MongoDB connection details (from `.env.local`):

```
mongodb+srv://Hospital_ry:Rohit321@hospital.wabbsrz.mongodb.net/?appName=Hospital
```

- **Username:** Hospital_ry
- **Password:** Rohit321
- **Cluster:** hospital.wabbsrz.mongodb.net
- **App Name:** Hospital

Use these credentials in MongoDB Compass, mongosh, or any MongoDB client.
