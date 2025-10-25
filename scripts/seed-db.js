const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/improve-my-city';

// Authority User Schema
const AuthorityUserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password_hash: { type: String, required: true },
  name: String,
  state: String,
  city: String,
  ward_ids: [String],
  dept_id: String,
  role: {
    type: String,
    enum: ["authority_admin"],
    default: "authority_admin",
  },
}, { timestamps: true });

const AuthorityUser = mongoose.model('AuthorityUser', AuthorityUserSchema);

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await AuthorityUser.deleteMany({});
    console.log('Cleared existing authority users');

    // Create test authority user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const testUser = new AuthorityUser({
      email: 'admin@city.gov.in',
      password_hash: hashedPassword,
      name: 'City Administrator',
      state: 'Maharashtra',
      city: 'Mumbai',
      ward_ids: ['ward-001', 'ward-002', 'ward-003'],
      dept_id: 'dept-001',
      role: 'authority_admin'
    });

    await testUser.save();
    console.log('Created test authority user:', testUser.email);

    console.log('\n=== Test Credentials ===');
    console.log('Email: admin@city.gov.in');
    console.log('Password: admin123');
    console.log('=======================\n');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();
