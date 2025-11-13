# Hospital service — MongoDB collections (examples)

## hospital_event_log

```json
{
  "hospital_id": 12,
  "events": [
    {"ts":"2025-11-13T10:12:00Z","type":"bed_reserved","bed_number":"E-14","incident_id":155}
  ]
}
```

## hospital_alerts

```json
{
  "incident_id":155,
  "alerts": [
    {"to":"family","method":"sms","status":"sent","ts":"2025-11-13T10:13:00Z"}
  ]
}
```

Notes:
- Keep binary objects (images, ECG) in object storage (S3/MinIO). Store metadata + small thumbnails in MongoDB.
- Index suggestions: `db.hospital_event_log.createIndex({hospital_id:1, 'events.ts':1})`