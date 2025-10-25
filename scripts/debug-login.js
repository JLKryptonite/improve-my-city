const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/improve-my-city';

// Define the schema exactly as in the model
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

async function debugLogin() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Try to find the user with the exact same query as the API
    const AuthorityUser = mongoose.model('AuthorityUser', AuthorityUserSchema, 'authorityusers');

    console.log('🔍 Looking for user: abc@city.gov.in');
    const user = await AuthorityUser.findOne({ email: 'abc@city.gov.in' });

    if (!user) {
      console.log('❌ User not found');
    } else {
      console.log('✅ User found with AuthorityUser model');
      console.log('User details:', {
        email: user.email,
        name: user.name,
        state: user.state,
        city: user.city,
        role: user.role,
        hasPasswordHash: !!user.password_hash
      });

      // Test password verification
      const bcrypt = require('bcryptjs');
      console.log('🔐 Testing password verification...');
      const isValid = await bcrypt.compare('1234', user.password_hash);
      console.log('Password verification result:', isValid ? '✅ Valid' : '❌ Invalid');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugLogin();