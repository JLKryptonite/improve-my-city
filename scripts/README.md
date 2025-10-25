# Database Scripts Guide

This directory contains scripts to manage the MongoDB database for the Improve My City application.

## Quick Start

### 1. Ensure MongoDB is Running

**Windows:**
```bash
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb/brew/mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 2. Set Up Authority Users

```bash
npm run seed
```

This creates a test admin user:
- Email: `admin@city.gov.in`
- Password: `admin123`

### 3. Test Database Connection

```bash
npm run test-db
```

### 4. Add Sample Complaints

```bash
npm run seed-complaints
```

This creates 6 sample complaints across different cities and statuses.

### 5. View Complaints

```bash
npm run view-complaints
```

Or filter by status:
```bash
npm run view-complaints status=pending
```

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Authority Users** |
| `add-user-credentials.js` | - | Manually add authority users |
| `seed-db.js` | `npm run seed` | Seed authority users |
| `test-connection.js` | `npm run test-db` | Test MongoDB connection & view users |
| **Complaints** |
| `test-complaints.js` | `npm run test-complaints` | Test complaints collection & show stats |
| `seed-complaints.js` | `npm run seed-complaints` | Add sample complaints |
| `view-complaints.js` | `npm run view-complaints` | View all complaints in detail |
| `clear-complaints.js` | `npm run clear-complaints` | Delete all complaints (with confirmation) |
| **Debug** |
| `debug-api.js` | - | Debug API endpoints |
| `debug-login.js` | - | Debug login functionality |
| `test-api.js` | - | Test API endpoints |
| `test-new-login.js` | - | Test new login implementation |
| `test-nextjs-db.js` | - | Test Next.js database integration |

## Complaint Status Flow

```
pending → in_progress → resolved
   ↓           ↓
   └─────→ stalled → revived → resolved
```

### Status Descriptions:

- **pending**: Newly submitted, awaiting action
- **in_progress**: Work has started
- **stalled**: No progress for 60+ days
- **revived**: Work resumed after being stalled
- **resolved**: Issue fixed and completed

## Database Structure

### Collections

1. **authorityusers** - Authority/admin users
2. **complaints** - Citizen complaints

### Complaint Document Example

```json
{
  "_id": "67123abc...",
  "category": "Pothole",
  "description": "Large pothole on main road",
  "location": {
    "type": "Point",
    "coordinates": [72.8777, 19.0760]
  },
  "state": "Maharashtra",
  "city": "Mumbai",
  "ward": "ward-001",
  "status": "pending",
  "created_at": "2025-10-20T10:30:00.000Z",
  "last_activity_at": "2025-10-20T10:30:00.000Z",
  "photos_before": ["/uploads/photo1.jpg"],
  "photos_progress": [],
  "photos_after": [],
  "timeline": [
    {
      "ts": "2025-10-20T10:30:00.000Z",
      "type": "submitted",
      "actor": "public"
    }
  ],
  "progress_deadline_days": 60,
  "accumulated_hold_seconds": 0,
  "hold_periods": [],
  "related_ids": []
}
```

## Common Tasks

### View Complaints by Status

```bash
# View pending complaints
npm run view-complaints status=pending

# View in progress
npm run view-complaints status=in_progress

# View resolved
npm run view-complaints status=resolved

# View stalled
npm run view-complaints status=stalled
```

### View Complaints by Location

```bash
# View Mumbai complaints
npm run view-complaints city=Mumbai

# View by category
npm run view-complaints category=Pothole
```

### Reset Database

```bash
# Clear all complaints
npm run clear-complaints

# Clear and reseed
npm run clear-complaints
npm run seed-complaints

# Reset authority users
npm run seed
```

### Check Database Health

```bash
# Test connection
npm run test-db

# Check complaints
npm run test-complaints

# View recent activity
npm run view-complaints
```

## MongoDB Shell Commands

### Connect to Database
```bash
mongosh mongodb://localhost:27017/improve-my-city
```

### Useful Queries

```javascript
// Count all complaints
db.complaints.countDocuments()

// Get status breakdown
db.complaints.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Find complaints by city
db.complaints.find({ city: "Mumbai" }).pretty()

// Find recent complaints (last 7 days)
db.complaints.find({
  created_at: { $gte: new Date(Date.now() - 7*24*60*60*1000) }
}).pretty()

// Find stalled complaints
db.complaints.find({ status: "stalled" }).pretty()

// Find complaints with photos
db.complaints.find({ 
  $or: [
    { photos_before: { $ne: [] } },
    { photos_progress: { $ne: [] } },
    { photos_after: { $ne: [] } }
  ]
}).count()

// Get complaints near location (5km radius)
db.complaints.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [72.8777, 19.0760] },
      $maxDistance: 5000
    }
  }
})
```

## Troubleshooting

### MongoDB Not Running

**Error:** `MongoServerError: connect ECONNREFUSED 127.0.0.1:27017`

**Fix:**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongod
sudo systemctl enable mongod  # Start on boot
```

### Check MongoDB Status

```bash
# Windows
sc query MongoDB

# macOS
brew services list

# Linux
sudo systemctl status mongod
```

### MongoDB Installation

If MongoDB is not installed:

**Windows:** Download from https://www.mongodb.com/try/download/community

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### Port Already in Use

If port 27017 is already in use by another process:

```bash
# Find process using port 27017
# Windows
netstat -ano | findstr :27017

# macOS/Linux
lsof -i :27017
```

### Database Permissions

Ensure your user has read/write permissions to the MongoDB data directory.

## Environment Variables

Create a `.env.local` file in the project root:

```env
MONGO_URI=mongodb://localhost:27017/improve-my-city
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DEV_ADMIN_KEY=dev-key-123
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
PORT=3000
```

## For More Information

- See `COMPLAINTS-DB-GUIDE.md` for detailed complaint management
- See `setup-mongodb.md` for MongoDB installation instructions
- MongoDB Documentation: https://docs.mongodb.com/

## Support Checklist

If something isn't working:

- [ ] MongoDB is running
- [ ] Can connect via `npm run test-db`
- [ ] Database has data: `npm run test-complaints`
- [ ] `.env.local` file exists (optional)
- [ ] Node modules installed: `npm install`
- [ ] Using Node.js v18 or higher

## Backup & Restore

### Backup
```bash
# Backup entire database
mongodump --db improve-my-city --out ./backup/$(date +%Y%m%d)

# Backup only complaints
mongodump --db improve-my-city --collection complaints --out ./backup
```

### Restore
```bash
# Restore entire database
mongorestore --db improve-my-city ./backup/20251025/improve-my-city

# Restore only complaints
mongorestore --db improve-my-city --collection complaints ./backup/improve-my-city/complaints.bson
```

## Production Considerations

Before deploying to production:

1. **Change default credentials** in `seed-db.js`
2. **Use strong JWT_SECRET** in environment variables
3. **Enable MongoDB authentication**
4. **Use MongoDB Atlas** or managed hosting
5. **Set up regular backups**
6. **Configure proper indexes** for performance
7. **Enable SSL/TLS** for connections
8. **Monitor database metrics**
9. **Set up alerting** for failures
10. **Review and update access controls**

