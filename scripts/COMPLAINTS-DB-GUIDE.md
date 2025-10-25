# Complaints Database Management Guide

This guide explains how to manage complaints in the MongoDB database for the Improve My City application.

## Overview

Complaints are stored in a MongoDB database with the following structure:

- **Database Name**: `improve-my-city`
- **Collection Name**: `complaints`
- **Connection String**: `mongodb://localhost:27017/improve-my-city`

## Complaint Schema

Each complaint document contains:

### Required Fields
- `category` (String): Type of complaint (e.g., "Pothole", "Streetlight", "Garbage")
- `location` (GeoJSON Point): Geographic coordinates [longitude, latitude]
- `status` (Enum): One of: "pending", "in_progress", "stalled", "revived", "resolved"

### Optional Fields
- `description` (String): Detailed description of the complaint
- `state` (String): State where the issue is located
- `city` (String): City where the issue is located
- `ward` (String): Ward/district identifier
- `created_at` (Date): When the complaint was created
- `first_progress_at` (Date): When work first started
- `progress_deadline_days` (Number): Days allowed for completion (default: 60)
- `stalled_since` (Date): When the complaint became stalled
- `revived_since` (Date): When work resumed after being stalled
- `last_activity_at` (Date): Last update timestamp

### Photo Arrays
- `photos_before` (Array of Strings): URLs of initial photos
- `photos_progress` (Array of Strings): URLs of work-in-progress photos
- `photos_after` (Array of Strings): URLs of completion photos

### Work Assignment
- `assigned` (Object):
  - `dept_id` (String): Department ID
  - `contractor_id` (String): Contractor ID
  - `due` (Date): Due date for completion

### Timeline
- `timeline` (Array of Objects): History of all events
  - `ts` (Date): Timestamp
  - `type` (String): Event type (submitted, progress_started, resolved, etc.)
  - `actor` (String): Who performed the action (public, official, system)
  - `note` (String): Optional note
  - `images` (Array): Optional images for this event
  - `reason` (String): Optional reason

### Related Data
- `related_ids` (Array of Strings): IDs of merged or related complaints
- `hold_periods` (Array): Periods when work was on hold
- `accumulated_hold_seconds` (Number): Total hold time in seconds

## Database Indexes

The collection has the following indexes for optimal performance:

1. **Geospatial Index**: On `location` field (2dsphere) for location-based queries
2. **Compound Index**: On `status`, `state`, `city`, `category` for filtering
3. **Created Date Index**: On `created_at` for sorting by date
4. **Status Date Index**: On `stalled_since` and `revived_since` for tracking

## Available Scripts

### 1. Test Complaints Database

Check if the database is properly configured and view statistics:

```bash
npm run test-complaints
```

This will:
- ✅ Verify MongoDB connection
- ✅ Check if complaints collection exists
- ✅ Show total complaint count
- ✅ Display complaints by status
- ✅ Show recent complaints (last 5)
- ✅ List all indexes

### 2. Seed Sample Complaints

Add sample complaints for testing:

```bash
npm run seed-complaints
```

This will create 6 sample complaints:
- 2 in Mumbai (Maharashtra)
- 2 in Bangalore (Karnataka)
- 2 in Delhi

With various statuses:
- Pending
- In Progress
- Resolved
- Stalled
- Revived

### 3. View All Complaints

Display all complaints in detail:

```bash
npm run view-complaints
```

**Filter by status:**
```bash
npm run view-complaints status=pending
```

**Filter by city:**
```bash
npm run view-complaints city=Mumbai
```

**Filter by category:**
```bash
npm run view-complaints category=Pothole
```

### 4. Clear All Complaints

Delete all complaints from the database (with confirmation):

```bash
npm run clear-complaints
```

⚠️ **WARNING**: This will permanently delete all complaints!

## Using MongoDB Compass (GUI)

You can also use MongoDB Compass for a visual interface:

1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. Navigate to database: `improve-my-city`
4. View collection: `complaints`

## Direct MongoDB Shell Commands

### Connect to MongoDB Shell
```bash
mongosh mongodb://localhost:27017/improve-my-city
```

### View All Complaints
```javascript
db.complaints.find().pretty()
```

### Count Complaints by Status
```javascript
db.complaints.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

### Find Pending Complaints
```javascript
db.complaints.find({ status: "pending" })
```

### Find Complaints in a City
```javascript
db.complaints.find({ city: "Mumbai" })
```

### Find Complaints Near a Location
```javascript
db.complaints.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [72.8777, 19.0760] },
      $maxDistance: 5000  // 5km radius
    }
  }
})
```

### Delete All Complaints
```javascript
db.complaints.deleteMany({})
```

### Drop the Collection
```javascript
db.complaints.drop()
```

## API Endpoints for Complaints

### Create a New Complaint
```
POST /api/complaints
Content-Type: multipart/form-data

Fields:
- category (required)
- description (required)
- latitude (required)
- longitude (required)
- accuracyM (optional, default: 10)
- images (required, at least 1)
```

### Get All Complaints
```
GET /api/complaints?status=pending&city=Mumbai&page=1&limit=20
```

Query Parameters:
- `status`: Filter by status
- `state`: Filter by state
- `city`: Filter by city
- `category`: Filter by category
- `ward`: Filter by ward
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### Get Single Complaint
```
GET /api/complaints/[id]
```

### Update Complaint (No Progress)
```
POST /api/complaints/[id]/no-progress
Content-Type: multipart/form-data

Fields:
- images (required)
```

### Authority Actions

#### Start Progress
```
POST /api/authority/complaints/[id]/start-progress
Authorization: Bearer <token>

Body: { "note": "Work has started" }
```

#### Mark as Resolved
```
POST /api/authority/complaints/[id]/resolve
Authorization: Bearer <token>

Body: { "note": "Issue resolved" }
```

#### Put on Hold
```
POST /api/authority/complaints/[id]/hold
Authorization: Bearer <token>

Body: { 
  "reason": "Reason for hold",
  "expected_resume_at": "2025-11-01T00:00:00.000Z"
}
```

#### Merge Complaints
```
POST /api/authority/complaints/[sourceId]/merge
Authorization: Bearer <token>

Body: {
  "target_id": "targetComplaintId",
  "note": "Merged as duplicate"
}
```

## Troubleshooting

### Connection Issues

**Error**: `MongoServerError: connect ECONNREFUSED`

**Solution**: Make sure MongoDB is running:
- Windows: `net start MongoDB`
- macOS: `brew services start mongodb/brew/mongodb-community`
- Linux: `sudo systemctl start mongod`

### No Complaints Showing

1. Check if MongoDB is running: `npm run test-db`
2. Check if complaints exist: `npm run test-complaints`
3. Seed sample data: `npm run seed-complaints`

### Index Issues

If you're experiencing slow queries, recreate indexes:

```javascript
// In MongoDB shell
use improve-my-city
db.complaints.dropIndexes()
db.complaints.createIndex({ location: "2dsphere" })
db.complaints.createIndex({ status: 1, state: 1, city: 1, category: 1 })
db.complaints.createIndex({ created_at: 1 })
db.complaints.createIndex({ stalled_since: 1, revived_since: 1 })
```

## Best Practices

1. **Always use the API endpoints** for creating/updating complaints (they handle validation and image processing)
2. **Use the scripts for testing** and viewing data
3. **Never manually edit** complaint documents unless necessary
4. **Backup data regularly** before running clear or bulk operations
5. **Use filters** when querying large datasets to improve performance
6. **Check indexes** periodically to ensure optimal query performance

## Data Backup

### Backup All Complaints
```bash
mongodump --db improve-my-city --collection complaints --out ./backup
```

### Restore Complaints
```bash
mongorestore --db improve-my-city --collection complaints ./backup/improve-my-city/complaints.bson
```

### Export as JSON
```bash
mongoexport --db improve-my-city --collection complaints --out complaints.json --pretty
```

### Import from JSON
```bash
mongoimport --db improve-my-city --collection complaints --file complaints.json
```

## Support

For issues or questions:
1. Check MongoDB logs
2. Verify connection string in `lib/db.ts`
3. Ensure all required packages are installed: `npm install`
4. Check Node.js version compatibility (v18+ recommended)

