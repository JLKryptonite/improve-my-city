# Quick Start - Complaints Database

## ✅ Setup Complete!

Your MongoDB complaints database is fully configured and operational.

## Quick Commands

```bash
# Test database connection
npm run test-complaints

# View all complaints
npm run view-complaints

# Add sample data (if needed)
npm run seed-complaints

# Filter complaints
npm run view-complaints status=pending
npm run view-complaints city=Mumbai
```

## What's Stored

Every complaint submitted through your app includes:

| Field | Description | Example |
|-------|-------------|---------|
| **Category** | Type of issue | "Pothole", "Streetlight" |
| **Description** | Details | "Large pothole on main road" |
| **Location** | GPS coordinates | [72.8777, 19.0760] |
| **State/City/Ward** | Location info | "Maharashtra", "Mumbai", "ward-001" |
| **Status** | Current state | pending → in_progress → resolved |
| **Photos** | Evidence images | Before, during, after |
| **Timeline** | Event history | All actions and updates |
| **Assignments** | Work details | Department, contractor, deadline |

## Current Database Stats

📊 **6 sample complaints loaded**:
- 🟡 Pending: 2
- 🔵 In Progress: 1
- ✅ Resolved: 1
- 🔴 Stalled: 1
- 🟠 Revived: 1

## How It Works

1. **User submits complaint** → API validates → Stored in MongoDB
2. **Authority reviews** → Updates status → Timeline logged
3. **Work progresses** → Photos added → Status changes
4. **Issue resolved** → Marked complete → Closure recorded

## Where Things Are

```
improve-my-city/
├── models/
│   └── Complaint.ts          ← Schema definition
├── lib/
│   ├── db.ts                 ← MongoDB connection
│   └── complaintService.ts   ← Database operations
├── app/api/complaints/       ← Public API endpoints
├── app/api/authority/        ← Authority endpoints
└── scripts/
    ├── test-complaints.js    ← Test & check stats
    ├── seed-complaints.js    ← Add sample data
    ├── view-complaints.js    ← View all complaints
    ├── clear-complaints.js   ← Delete all
    └── COMPLAINTS-DB-GUIDE.md ← Full documentation
```

## API Endpoints

### Create Complaint
```bash
POST /api/complaints
Content-Type: multipart/form-data

Fields:
- category, description, latitude, longitude, images
```

### List Complaints
```bash
GET /api/complaints?status=pending&city=Mumbai&page=1&limit=20
```

### Get Single Complaint
```bash
GET /api/complaints/[id]
```

### Authority Actions (Requires Auth)
```bash
POST /api/authority/complaints/[id]/start-progress
POST /api/authority/complaints/[id]/resolve
POST /api/authority/complaints/[id]/hold
```

## MongoDB Direct Access

```bash
# Connect to MongoDB shell
mongosh mongodb://localhost:27017/improve-my-city

# View all complaints
db.complaints.find().pretty()

# Count complaints
db.complaints.countDocuments()

# Filter by status
db.complaints.find({ status: "pending" })

# Find by city
db.complaints.find({ city: "Mumbai" })
```

## Troubleshooting

**MongoDB not running?**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongod
```

**No data showing?**
```bash
npm run seed-complaints
```

**Need help?**
- See `COMPLAINTS-DATABASE-SETUP.md` for complete guide
- See `scripts/COMPLAINTS-DB-GUIDE.md` for detailed docs
- See `scripts/README.md` for all available scripts

## What's Next?

1. **Run the app**: `npm run dev`
2. **Submit a complaint**: Visit `/report`
3. **View complaints**: Visit `/complaints`
4. **Authority login**: Visit `/authority/login`
   - Email: `admin@city.gov.in`
   - Password: `admin123`

## Success! 🎉

Your complaints are now being stored in MongoDB with:
- ✅ Complete complaint structure
- ✅ Geospatial indexing
- ✅ Status tracking
- ✅ Timeline history
- ✅ Photo management
- ✅ Performance optimization

All set! Your Improve My City app now has a fully functional complaints database.

