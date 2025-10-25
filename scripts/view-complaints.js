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

const Complaint = mongoose.model('Complaint', ComplaintSchema);

async function viewComplaints() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get filter from command line args
    const args = process.argv.slice(2);
    const filter = {};
    
    if (args.length > 0) {
      const [key, value] = args[0].split('=');
      if (key && value) {
        filter[key] = value;
        console.log(`🔍 Filtering by: ${key} = ${value}\n`);
      }
    }

    // Fetch complaints
    const complaints = await Complaint.find(filter)
      .sort({ created_at: -1 })
      .limit(20);

    if (complaints.length === 0) {
      console.log('📭 No complaints found matching the criteria.');
      return;
    }

    console.log(`📋 Found ${complaints.length} complaint(s):\n`);
    console.log('='.repeat(80));

    complaints.forEach((complaint, index) => {
      console.log(`\n${index + 1}. COMPLAINT ID: ${complaint._id}`);
      console.log('-'.repeat(80));
      console.log(`   Category: ${complaint.category}`);
      console.log(`   Description: ${complaint.description || 'N/A'}`);
      console.log(`   Status: ${complaint.status.toUpperCase()}`);
      console.log(`   Location: ${complaint.city}, ${complaint.state} ${complaint.ward ? `(${complaint.ward})` : ''}`);
      console.log(`   Coordinates: [${complaint.location.coordinates[1]}, ${complaint.location.coordinates[0]}]`);
      console.log(`   Created: ${complaint.created_at.toISOString()}`);
      console.log(`   Last Activity: ${complaint.last_activity_at.toISOString()}`);
      
      if (complaint.first_progress_at) {
        console.log(`   Progress Started: ${complaint.first_progress_at.toISOString()}`);
      }
      
      if (complaint.stalled_since) {
        console.log(`   Stalled Since: ${complaint.stalled_since.toISOString()}`);
      }
      
      if (complaint.revived_since) {
        console.log(`   Revived Since: ${complaint.revived_since.toISOString()}`);
      }
      
      console.log(`   Photos Before: ${complaint.photos_before.length}`);
      console.log(`   Photos Progress: ${complaint.photos_progress.length}`);
      console.log(`   Photos After: ${complaint.photos_after.length}`);
      
      if (complaint.assigned) {
        console.log(`   Assigned: Dept ${complaint.assigned.dept_id || 'N/A'}, Contractor ${complaint.assigned.contractor_id || 'N/A'}`);
      }
      
      if (complaint.timeline && complaint.timeline.length > 0) {
        console.log(`\n   Timeline (${complaint.timeline.length} events):`);
        complaint.timeline.forEach((event, i) => {
          console.log(`     ${i + 1}. [${event.ts.toISOString()}] ${event.type} (${event.actor})`);
          if (event.note) {
            console.log(`        Note: ${event.note}`);
          }
          if (event.reason) {
            console.log(`        Reason: ${event.reason}`);
          }
        });
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n💡 Usage tips:');
    console.log('   - View all: node scripts/view-complaints.js');
    console.log('   - Filter by status: node scripts/view-complaints.js status=pending');
    console.log('   - Filter by city: node scripts/view-complaints.js city=Mumbai');
    console.log('   - Filter by category: node scripts/view-complaints.js category=Pothole');

  } catch (error) {
    console.error('❌ Error viewing complaints:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

viewComplaints();

