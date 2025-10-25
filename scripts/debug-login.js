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
    const AuthorityUser = mongoose.model('AuthorityUser', AuthorityUserSchema);
    
    console.log('🔍 Looking for user: admin@city.gov.in');
    const user = await AuthorityUser.findOne({ email: 'admin@city.gov.in' });
    
    if (!user) {
      console.log('❌ User not found with AuthorityUser model');
      
      // Try with the exact collection name
      console.log('🔍 Trying with collection name...');
      const AuthorityUserDirect = mongoose.model('AuthorityUser', AuthorityUserSchema, 'authorityusers');
      const userDirect = await AuthorityUserDirect.findOne({ email: 'admin@city.gov.in' });
      
      if (userDirect) {
        console.log('✅ User found with direct collection reference');
        console.log('User details:', {
          email: userDirect.email,
          name: userDirect.name,
          state: userDirect.state,
          city: userDirect.city,
          role: userDirect.role
        });
      } else {
        console.log('❌ User still not found');
      }
    } else {
      console.log('✅ User found with AuthorityUser model');
      console.log('User details:', {
        email: user.email,
        name: user.name,
        state: user.state,
        city: user.city,
        role: user.role
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugLogin();