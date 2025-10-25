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

// Sample complaint data
const sampleComplaints = [
  {
    category: 'Pothole',
    description: 'Large pothole on main road causing traffic issues',
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760] // Mumbai
    },
    state: 'Maharashtra',
    city: 'Mumbai',
    ward: 'ward-001',
    status: 'pending',
    photos_before: ['/uploads/sample1.jpg'],
    timeline: [{
      ts: new Date(),
      type: 'submitted',
      actor: 'public'
    }]
  },
  {
    category: 'Streetlight',
    description: 'Streetlight not working for past 2 weeks',
    location: {
      type: 'Point',
      coordinates: [72.8800, 19.0780] // Mumbai
    },
    state: 'Maharashtra',
    city: 'Mumbai',
    ward: 'ward-001',
    status: 'in_progress',
    first_progress_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    photos_before: ['/uploads/sample2.jpg'],
    timeline: [
      {
        ts: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        type: 'submitted',
        actor: 'public'
      },
      {
        ts: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        type: 'progress_started',
        actor: 'official',
        note: 'Contractor assigned'
      }
    ]
  },
  {
    category: 'Garbage',
    description: 'Overflowing garbage bin near market area',
    location: {
      type: 'Point',
      coordinates: [72.8820, 19.0800] // Mumbai
    },
    state: 'Maharashtra',
    city: 'Mumbai',
    ward: 'ward-002',
    status: 'resolved',
    first_progress_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    photos_before: ['/uploads/sample3.jpg'],
    photos_after: ['/uploads/sample3-after.jpg'],
    timeline: [
      {
        ts: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        type: 'submitted',
        actor: 'public'
      },
      {
        ts: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        type: 'progress_started',
        actor: 'official',
        note: 'Sanitation team assigned'
      },
      {
        ts: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        type: 'resolved',
        actor: 'official',
        note: 'New garbage bin installed'
      }
    ]
  },
  {
    category: 'Water Supply',
    description: 'Irregular water supply in the area',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716] // Bangalore
    },
    state: 'Karnataka',
    city: 'Bangalore',
    ward: 'ward-101',
    status: 'pending',
    photos_before: ['/uploads/sample4.jpg'],
    timeline: [{
      ts: new Date(),
      type: 'submitted',
      actor: 'public'
    }]
  },
  {
    category: 'Road Construction',
    description: 'Road construction left incomplete for months',
    location: {
      type: 'Point',
      coordinates: [77.6000, 12.9800] // Bangalore
    },
    state: 'Karnataka',
    city: 'Bangalore',
    ward: 'ward-102',
    status: 'stalled',
    first_progress_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    stalled_since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    photos_before: ['/uploads/sample5.jpg'],
    photos_progress: ['/uploads/sample5-progress.jpg'],
    timeline: [
      {
        ts: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        type: 'submitted',
        actor: 'public'
      },
      {
        ts: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        type: 'progress_started',
        actor: 'official',
        note: 'Construction started'
      },
      {
        ts: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        type: 'stalled_auto',
        actor: 'system',
        note: 'No progress for 60 days'
      }
    ]
  },
  {
    category: 'Drainage',
    description: 'Blocked drainage causing waterlogging',
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139] // Delhi
    },
    state: 'Delhi',
    city: 'New Delhi',
    ward: 'ward-201',
    status: 'revived',
    first_progress_at: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
    stalled_since: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    revived_since: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    photos_before: ['/uploads/sample6.jpg'],
    timeline: [
      {
        ts: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
        type: 'submitted',
        actor: 'public'
      },
      {
        ts: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
        type: 'progress_started',
        actor: 'official',
        note: 'Work initiated'
      },
      {
        ts: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        type: 'stalled_auto',
        actor: 'system',
        note: 'No progress for 60 days'
      },
      {
        ts: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        type: 'revived_on_progress',
        actor: 'official',
        note: 'Work resumed after monsoon'
      }
    ]
  }
];

async function seedComplaints() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Ask if user wants to clear existing complaints
    console.log('\n⚠️  This will add sample complaints to the database');
    
    // Insert sample complaints
    console.log('\n📝 Creating sample complaints...');
    
    for (const complaintData of sampleComplaints) {
      const complaint = await Complaint.create(complaintData);
      console.log(`  ✅ Created complaint: ${complaint._id} - ${complaint.category} (${complaint.status})`);
    }

    console.log('\n✅ Successfully seeded sample complaints!');

    // Show summary
    const totalCount = await Complaint.countDocuments();
    console.log(`\n📊 Total complaints in database: ${totalCount}`);

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

    console.log('\n🎯 You can now view these complaints in the application!');
    console.log('   Navigate to: http://localhost:3000/complaints');

  } catch (error) {
    console.error('❌ Error seeding complaints:', error.message);
    if (error.code === 11000) {
      console.log('💡 Duplicate entries detected. This is normal if running seed multiple times.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

seedComplaints();

