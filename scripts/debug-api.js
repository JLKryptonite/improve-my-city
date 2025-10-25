const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Test the exact same connection and logic as the API
const MONGODB_URI = 'mongodb://localhost:27017/improve-my-city';

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

async function debugAPI() {
  try {
    console.log('🔍 Debugging API login logic...');
    console.log('MongoDB URI:', MONGODB_URI);
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'admin@city.gov.in';
    const password = 'admin123';

    console.log(`🔍 Looking for user with email: ${email}`);
    
    // Find user (same as API)
    const user = await AuthorityUser.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found - this is the issue!');
      
      // Let's see what users exist
      const allUsers = await AuthorityUser.find({});
      console.log('All users in database:', allUsers.map(u => ({ email: u.email, name: u.name })));
      
      return;
    }

    console.log('✅ User found:', {
      email: user.email,
      name: user.name,
      state: user.state,
      city: user.city,
      role: user.role
    });

    // Test password verification (same as API)
    console.log('🔐 Testing password verification...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValidPassword ? 'Yes' : 'No');
    
    if (!isValidPassword) {
      console.log('❌ Password verification failed');
      console.log('Stored hash:', user.password_hash.substring(0, 20) + '...');
      
      // Try creating a new hash
      const newHash = await bcrypt.hash(password, 12);
      const newHashValid = await bcrypt.compare(password, newHash);
      console.log('New hash test:', newHashValid ? 'Works' : 'Fails');
    } else {
      console.log('✅ Password verification successful');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

debugAPI();
