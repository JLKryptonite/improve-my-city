# Complaints Database Setup - Complete! ✅

The complaints database has been successfully set up in MongoDB with the full complaint structure.

## What's Been Configured

### 1. MongoDB Collection: `complaints`

Your complaints are now being stored in:
- **Database**: `improve-my-city`
- **Collection**: `complaints`
- **Connection**: `mongodb://localhost:27017/improve-my-city`

### 2. Complete Complaint Schema

Each complaint document includes:

#### Core Fields
- ✅ Category (e.g., Pothole, Streetlight, Garbage)
- ✅ Description
- ✅ Location (GeoJSON with coordinates)
- ✅ State, City, Ward
- ✅ Status (pending, in_progress, stalled, revived, resolved)

#### Tracking Fields
- ✅ Created timestamp
- ✅ Last activity timestamp
- ✅ First progress timestamp
- ✅ Progress deadline (60 days default)
- ✅ Stalled/revived tracking

#### Media & Evidence
- ✅ Photos before (initial evidence)
- ✅ Photos during progress (work updates)
- ✅ Photos after (completion proof)

#### Work Management
- ✅ Assignment details (department, contractor, due date)
- ✅ Hold periods with reasons
- ✅ Accumulated hold time calculation
- ✅ Related complaint IDs for merges

#### Activity Timeline
- ✅ Complete event history
- ✅ Event types (submitted, progress_started, resolved, etc.)
- ✅ Actor tracking (public, official, system)
- ✅ Notes and images per event

### 3. Performance Indexes

Optimized for fast queries:
- ✅ Geospatial index (2dsphere) for location searches
- ✅ Compound index on status, state, city, category
- ✅ Created date index for chronological sorting
- ✅ Status date index for tracking

## Available Tools

### Management Scripts

| Command | Purpose |
|---------|---------|
| `npm run test-complaints` | Check database status & statistics |
| `npm run seed-complaints` | Add 6 sample complaints for testing |
| `npm run view-complaints` | View all complaints in detail |
| `npm run view-complaints status=pending` | Filter by status |
| `npm run view-complaints city=Mumbai` | Filter by city |
| `npm run clear-complaints` | Delete all complaints |

### Current Sample Data

The database now contains **6 sample complaints**:

1. **Pothole** (Mumbai) - Status: PENDING
2. **Streetlight** (Mumbai) - Status: IN_PROGRESS
3. **Garbage** (Mumbai) - Status: RESOLVED
4. **Water Supply** (Bangalore) - Status: PENDING
5. **Road Construction** (Bangalore) - Status: STALLED
6. **Drainage** (Delhi) - Status: REVIVED

### Status Distribution
- 🟡 Pending: 2 complaints
- 🔵 In Progress: 1 complaint
- ✅ Resolved: 1 complaint
- 🔴 Stalled: 1 complaint
- 🟠 Revived: 1 complaint

## How It Works

### When Users Submit Complaints

1. **User submits via web interface** (`/report`)
   - Uploads photos
   - Selects location on map
   - Provides description

2. **API validates and processes** (`/api/complaints` POST)
   - Validates photo location and timestamp
   - Strips EXIF data and compresses images
   - Checks for duplicate complaints nearby
   - Creates complaint document in MongoDB

3. **Complaint stored with structure:**
```javascript
{
  _id: "68fd4ef1...",
  category: "Pothole",
  description: "Large pothole causing issues",
  location: {
    type: "Point",
    coordinates: [72.8777, 19.0760]
  },
  state: "Maharashtra",
  city: "Mumbai",
  status: "pending",
  photos_before: ["/uploads/image1.jpg"],
  timeline: [{
    ts: "2025-10-25T22:28:01.845Z",
    type: "submitted",
    actor: "public"
  }],
  // ... more fields
}
```

### When Authorities Take Action

Authorities can update complaints through the dashboard:

- **Start Progress**: Changes status to `in_progress`, adds timeline event
- **Add Updates**: Adds progress photos and timeline entries
- **Put on Hold**: Tracks hold periods and reasons
- **Mark Resolved**: Changes status to `resolved`, adds completion photos
- **Merge Duplicates**: Combines photos and timelines from similar complaints

### Automatic System Actions

The system automatically:

- ✅ Marks complaints as "stalled" after 60 days of no progress
- ✅ Tracks hold periods separately from stalled time
- ✅ Updates last activity timestamps
- ✅ Calculates accumulated hold duration
- ✅ Maintains complete timeline history

## API Endpoints

### Public Endpoints

```
GET  /api/complaints                      - List all complaints (with filters)
GET  /api/complaints/[id]                 - Get single complaint
POST /api/complaints                      - Create new complaint
POST /api/complaints/[id]/no-progress     - Add "no progress" update
GET  /api/metrics                         - Get complaint statistics
```

### Authority Endpoints (Requires Auth)

```
GET  /api/authority/complaints            - List complaints (authority view)
GET  /api/authority/complaints/[id]       - Get complaint details
POST /api/authority/complaints/[id]/start-progress  - Start work
POST /api/authority/complaints/[id]/progress        - Add progress update
POST /api/authority/complaints/[id]/hold            - Put on hold
POST /api/authority/complaints/[id]/resolve         - Mark resolved
POST /api/authority/complaints/[id]/merge           - Merge with another
```

## Database Query Examples

### Via Scripts

```bash
# View all complaints
npm run view-complaints

# Filter by status
npm run view-complaints status=pending

# Filter by city
npm run view-complaints city=Mumbai

# Filter by category
npm run view-complaints category=Pothole
```

### Via MongoDB Shell

```bash
# Connect
mongosh mongodb://localhost:27017/improve-my-city

# Count complaints
db.complaints.countDocuments()

# Find pending complaints
db.complaints.find({ status: "pending" })

# Find by city
db.complaints.find({ city: "Mumbai" })

# Find complaints near location (5km)
db.complaints.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [72.8777, 19.0760] },
      $maxDistance: 5000
    }
  }
})

# Get status breakdown
db.complaints.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

## Features Implemented

### ✅ Complete CRUD Operations
- Create complaints via API
- Read/list with filtering and pagination
- Update status and add progress
- Soft delete via merge functionality

### ✅ Geospatial Features
- GeoJSON location storage
- Distance-based queries
- Nearby duplicate detection
- 2dsphere indexing

### ✅ Status Management
- Pending → In Progress → Resolved flow
- Automatic stall detection (60 days)
- Revival tracking
- Hold period management

### ✅ Media Management
- Before/during/after photos
- Image processing (EXIF stripping, compression)
- Photo validation (location, timestamp)
- Timeline image attachments

### ✅ Timeline & History
- Complete event logging
- Actor attribution (public/official/system)
- Notes and reasons
- Timestamp tracking

### ✅ Performance Optimization
- Multiple indexes for fast queries
- Pagination support
- Aggregation pipelines
- Efficient filtering

## Next Steps

### For Development

1. **Test the API**:
   ```bash
   npm run dev
   # Navigate to http://localhost:3000
   ```

2. **Submit a test complaint**:
   - Go to `/report`
   - Fill in details and upload photos
   - Check it appears in database

3. **View complaints**:
   ```bash
   npm run view-complaints
   ```

### For Production

1. **Use MongoDB Atlas** or managed database
2. **Update connection string** in `lib/db.ts`
3. **Enable authentication** on MongoDB
4. **Set up backups** (automated daily)
5. **Monitor query performance**
6. **Configure proper indexes**
7. **Set up logging** and error tracking

## Documentation

- 📘 **Complaint DB Guide**: `scripts/COMPLAINTS-DB-GUIDE.md` - Detailed database documentation
- 📗 **Scripts README**: `scripts/README.md` - Quick reference for all scripts
- 📙 **MongoDB Setup**: `scripts/setup-mongodb.md` - Installation instructions

## Verification Checklist

- ✅ MongoDB is running
- ✅ Database `improve-my-city` exists
- ✅ Collection `complaints` created
- ✅ Schema with all required fields
- ✅ Indexes created (geospatial, compound, date)
- ✅ Sample data seeded (6 complaints)
- ✅ Scripts working (test, seed, view, clear)
- ✅ API endpoints functional
- ✅ Timeline tracking operational
- ✅ Status management working

## Support

If you encounter issues:

1. **Check MongoDB is running**:
   ```bash
   npm run test-db
   ```

2. **Verify complaints collection**:
   ```bash
   npm run test-complaints
   ```

3. **View data**:
   ```bash
   npm run view-complaints
   ```

4. **Reseed if needed**:
   ```bash
   npm run clear-complaints
   npm run seed-complaints
   ```

## Success! 🎉

Your complaints database is now fully operational! All registered complaints will be automatically stored in MongoDB according to the complete structure defined in the Complaint model.

You can now:
- ✅ Accept complaints via the web interface
- ✅ Store them with full details in MongoDB
- ✅ Query and filter complaints efficiently
- ✅ Track status changes and progress
- ✅ Manage complaints through authority dashboard
- ✅ Generate statistics and metrics

