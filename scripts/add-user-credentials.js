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

async function addUserCredentials() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await AuthorityUser.findOne({ email: 'abc@city.gov.in' });
    if (existingUser) {
      console.log('User abc@city.gov.in already exists. Updating password...');
      const hashedPassword = await bcrypt.hash('1234', 12);
      existingUser.password_hash = hashedPassword;
      await existingUser.save();
      console.log('✅ Updated password for existing user');
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash('1234', 12);
      
      const newUser = new AuthorityUser({
        email: 'abc@city.gov.in',
        password_hash: hashedPassword,
        name: 'City Authority User',
        state: 'Maharashtra',
        city: 'Mumbai',
        ward_ids: ['ward-001', 'ward-002', 'ward-003'],
        dept_id: 'dept-001',
        role: 'authority_admin'
      });

      await newUser.save();
      console.log('✅ Created new authority user:', newUser.email);
    }

    console.log('\n=== New Login Credentials ===');
    console.log('Email: abc@city.gov.in');
    console.log('Password: 1234');
    console.log('=============================\n');

  } catch (error) {
    console.error('❌ Error adding user credentials:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addUserCredentials();
