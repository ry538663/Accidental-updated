// MongoDB migration scripts for Map + Hospital services
// Run these in MongoDB shell or use Python driver (see migrate_mongodb.py)

// ============= MAP SERVICE COLLECTIONS =============

// 1. ambulance_live_logs - one doc per ping event
db.ambulance_live_logs.insertOne({
  _id: ObjectId(),
  ambulance_id: "AMB-101",
  timestamp: new Date("2025-11-13T10:20:00Z"),
  location: { type: "Point", coordinates: [80.9967, 26.8893] },
  speed: 62.5,
  fuel: 40,
  battery: 88,
});

// 2. incident_timeline - audit log for each incident's lifecycle
db.incident_timeline.insertOne({
  incident_id: 155,
  timeline: [
    { ts: new Date("2025-11-13T10:00:00Z"), event: "created", meta: {} },
    {
      ts: new Date("2025-11-13T10:05:00Z"),
      event: "ambulance_assigned",
      meta: { ambulance_id: "AMB-101" },
    },
  ],
});

// 3. patient_condition_media - media uploads (images, docs)
db.patient_condition_media.insertOne({
  incident_id: 155,
  media: [
    {
      id: "m1",
      type: "image",
      storage_url: "s3://bucket/img1.jpg",
      uploaded_at: new Date("2025-11-13T10:10:00Z"),
      size_bytes: 1024000,
    },
  ],
});

// ============= HOSPITAL SERVICE COLLECTIONS =============

// 4. hospital_event_log - events for each hospital
db.hospital_event_log.insertOne({
  hospital_id: 12,
  events: [
    {
      ts: new Date("2025-11-13T10:12:00Z"),
      type: "bed_reserved",
      bed_number: "E-14",
      incident_id: 155,
    },
  ],
});

// 5. hospital_alerts - audit trail for alerts sent to family/police
db.hospital_alerts.insertOne({
  incident_id: 155,
  alerts: [
    {
      to: "family",
      method: "sms",
      phone: "+919876543210",
      status: "sent",
      ts: new Date("2025-11-13T10:13:00Z"),
    },
  ],
});

// ============= CREATE INDEXES =============

// Geo index for ambulance location queries (nearest ambulance)
db.ambulance_live_logs.createIndex({ location: "2dsphere" });

// Recent pings by ambulance (for timeline views)
db.ambulance_live_logs.createIndex({ ambulance_id: 1, timestamp: -1 });

// Incident timeline lookup
db.incident_timeline.createIndex({ incident_id: 1 });

// Hospital event log
db.hospital_event_log.createIndex({ hospital_id: 1, "events.ts": 1 });

// Hospital alerts
db.hospital_alerts.createIndex({ incident_id: 1 });

console.log("✓ MongoDB collections created");
console.log("✓ Indexes created");
