const mongoose = require('mongoose');
const readline = require('readline');

// MongoDB connection
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/improve-my-city';

// Complaint Schema
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
    enum: ["pending", "in_progress", "stalled", "revived", "resolved"],
    default: "pending",
  },
  created_at: { type: Date, default: () => new Date() },
  photos_before: [String],
  photos_progress: [String],
  photos_after: [String],
  timeline: [mongoose.Schema.Types.Mixed],
});

const Complaint = mongoose.model('Complaint', ComplaintSchema);

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function clearComplaints() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Count existing complaints
    const count = await Complaint.countDocuments();
    
    if (count === 0) {
      console.log('📭 No complaints found in the database.');
      return;
    }

    console.log(`⚠️  Found ${count} complaint(s) in the database.`);
    console.log('⚠️  This action will DELETE ALL complaints permanently!\n');

    const answer = await askQuestion('Are you sure you want to delete all complaints? (yes/no): ');

    if (answer.toLowerCase() === 'yes') {
      await Complaint.deleteMany({});
      console.log('\n✅ All complaints have been deleted successfully!');
    } else {
      console.log('\n❌ Operation cancelled. No complaints were deleted.');
    }

  } catch (error) {
    console.error('❌ Error clearing complaints:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

clearComplaints();

