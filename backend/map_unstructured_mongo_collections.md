# Map service — MongoDB collections (examples)

## ambulance_live_logs (one doc per ping)

```json
{
  "_id": "ObjectId(...)",
  "ambulance_id": "AMB-101",
  "timestamp": "2025-11-13T10:20:00Z",
  "location": { "type": "Point", "coordinates": [80.9967, 26.8893] },
  "speed": 62.5,
  "fuel": 40,
  "battery": 88
}
```

Notes:
- Use GeoJSON `location` with a `2dsphere` index for nearest-ambulance queries.
- Keep raw sensor dumps and high-frequency telemetry here (mongodb or time-series store).

## incident_timeline

```json
{
  "incident_id": 155,
  "timeline": [
    {"ts":"2025-11-13T10:00:00Z","event":"created","meta":{}},
    {"ts":"2025-11-13T10:05:00Z","event":"ambulance_assigned","meta":{"ambulance_id":"AMB-101"}}
  ]
}
```

## patient_condition_media

```json
{
  "incident_id": 155,
  "media": [
    {"id":"m1","type":"image","storage_url":"s3://.../img1.jpg","uploaded_at":"2025-11-13T10:10:00Z"}
  ]
}
```

Index recommendations:

```
db.ambulance_live_logs.createIndex({ location: '2dsphere' })
db.ambulance_live_logs.createIndex({ ambulance_id: 1, timestamp: -1 })
db.incident_timeline.createIndex({ incident_id: 1 })
```