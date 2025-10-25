// Test the exact same database connection logic as Next.js
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/improve-my-city';

// This is the exact same schema as in the model
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

// Use the same model name as in the Next.js app
const AuthorityUser = mongoose.models.AuthorityUser || mongoose.model("AuthorityUser", AuthorityUserSchema);

async function testNextJSConnection() {
  try {
    console.log('🔍 Testing Next.js database connection...');
    console.log('MongoDB URI:', MONGODB_URI);
    
    // Connect using the same logic as dbConnect
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log('✅ Connected to MongoDB');

    // Test the exact same query as the API
    const user = await AuthorityUser.findOne({ email: 'admin@city.gov.in' });
    
    if (user) {
      console.log('✅ User found:', {
        email: user.email,
        name: user.name,
        state: user.state,
        city: user.city,
        role: user.role
      });
    } else {
      console.log('❌ User not found');
      
      // Check what users exist
      const allUsers = await AuthorityUser.find({});
      console.log('All users:', allUsers.map(u => ({ email: u.email, name: u.name })));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testNextJSConnection();
