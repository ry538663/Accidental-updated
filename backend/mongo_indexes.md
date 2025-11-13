# MongoDB index suggestions

# Geo index for ambulance pings
db.ambulance_live_logs.createIndex({ location: '2dsphere' })

# Recent pings by ambulance
db.ambulance_live_logs.createIndex({ ambulance_id: 1, timestamp: -1 })

# Incident timeline lookup
db.incident_timeline.createIndex({ incident_id: 1 })

# Hospital event log
db.hospital_event_log.createIndex({ hospital_id: 1, 'events.ts': 1 })
