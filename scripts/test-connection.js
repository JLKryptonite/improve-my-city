const mongoose = require('mongoose');

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

async function testConnection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Check if users exist
    const userCount = await AuthorityUser.countDocuments();
    console.log(`📊 Found ${userCount} authority users in database`);

    if (userCount > 0) {
      const users = await AuthorityUser.find({}, 'email name state city role');
      console.log('\n👥 Authority Users:');
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.name}) - ${user.state}, ${user.city}`);
      });
    }

    console.log('\n🎯 Ready for testing!');
    console.log('Navigate to: http://localhost:3000/authority/login');
    console.log('Test credentials: admin@city.gov.in / admin123');

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('\n💡 Make sure MongoDB is running:');
    console.log('  Windows: net start MongoDB');
    console.log('  macOS: brew services start mongodb/brew/mongodb-community');
    console.log('  Linux: sudo systemctl start mongod');
  } finally {
    await mongoose.disconnect();
  }
}

testConnection();
