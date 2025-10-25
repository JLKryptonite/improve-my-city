const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/improve-my-city';

// Complaint Schema
const TimelineEventSchema = new mongoose.Schema(
  {
    ts: { type: Date, required: true },
    type: { type: String, required: true },
    note: String,
    actor: {
      type: String,
      enum: ["public", "official", "system"],
      required: true,
    },
    images: [String],
    reason: String,
  },
  { _id: false }
);

const ComplaintSchema = new mongoose.Schema({
  category: { type: String, required: true },
  description: { type: String },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  state: String,
  city: String,
  ward: String,
  status: {
    type: String,
    enum: [
      "pending",
      "in_progress",
      "stalled",
      "revived",
      "resolved",
    ],
    default: "pending",
  },
  created_at: { type: Date, default: () => new Date() },
  first_progress_at: Date,
  progress_deadline_days: { type: Number, default: 60 },
  hold_periods: [
    {
      start: Date,
      expected_resume_at: Date,
      end: Date,
      reason: String,
    },
  ],
  accumulated_hold_seconds: { type: Number, default: 0 },
  stalled_since: Date,
  revived_since: Date,
  last_activity_at: { type: Date, default: () => new Date() },
  assigned: { dept_id: String, contractor_id: String, due: Date },
  photos_before: [String],
  photos_progress: [String],
  photos_after: [String],
  related_ids: [String],
  timeline: [TimelineEventSchema],
});

// Add indexes for better query performance
ComplaintSchema.index({ location: "2dsphere" });
ComplaintSchema.index({ status: 1, state: 1, city: 1, category: 1 });
ComplaintSchema.index({ created_at: 1 });
ComplaintSchema.index({ stalled_since: 1, revived_since: 1 });

const Complaint = mongoose.model('Complaint', ComplaintSchema);

async function testComplaints() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Check if complaints collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const complaintCollection = collections.find(c => c.name === 'complaints');
    
    if (complaintCollection) {
      console.log('✅ Complaints collection exists');
    } else {
      console.log('⚠️  Complaints collection does not exist yet (will be created on first insert)');
    }

    // Count total complaints
    const totalCount = await Complaint.countDocuments();
    console.log(`\n📊 Total complaints in database: ${totalCount}`);

    if (totalCount > 0) {
      // Get complaints by status
      const statusCounts = await Complaint.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      console.log('\n📈 Complaints by Status:');
      statusCounts.forEach(stat => {
        console.log(`  - ${stat._id}: ${stat.count}`);
      });

      // Get recent complaints
      const recentComplaints = await Complaint.find()
        .sort({ created_at: -1 })
        .limit(5)
        .select('category description status state city created_at location');

      console.log('\n🆕 Recent Complaints (last 5):');
      recentComplaints.forEach((complaint, index) => {
        console.log(`\n  ${index + 1}. ID: ${complaint._id}`);
        console.log(`     Category: ${complaint.category}`);
        console.log(`     Description: ${complaint.description || 'N/A'}`);
        console.log(`     Status: ${complaint.status}`);
        console.log(`     Location: ${complaint.city}, ${complaint.state}`);
        console.log(`     Coordinates: [${complaint.location.coordinates[1]}, ${complaint.location.coordinates[0]}]`);
        console.log(`     Created: ${complaint.created_at.toISOString()}`);
      });

      // Check indexes
      console.log('\n🗂️  Indexes on complaints collection:');
      const indexes = await Complaint.collection.getIndexes();
      Object.keys(indexes).forEach(indexName => {
        console.log(`  - ${indexName}:`, JSON.stringify(indexes[indexName]));
      });
    } else {
      console.log('\n💡 No complaints found. Create some complaints to see them here!');
      console.log('   You can use the seed-complaints.js script or the web interface.');
    }

    console.log('\n✅ MongoDB complaints database is properly configured!');

  } catch (error) {
    console.error('❌ Error testing complaints:', error.message);
    console.log('\n💡 Make sure MongoDB is running:');
    console.log('  Windows: net start MongoDB');
    console.log('  macOS: brew services start mongodb/brew/mongodb-community');
    console.log('  Linux: sudo systemctl start mongod');
  } finally {
    await mongoose.disconnect();
  }
}

testComplaints();

