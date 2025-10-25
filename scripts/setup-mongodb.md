# MongoDB Setup Guide

## Prerequisites
Make sure you have MongoDB installed locally. If not, follow these steps:

### Windows
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install MongoDB with default settings
3. Start MongoDB service: `net start MongoDB`

### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Environment Setup

1. Create a `.env.local` file in the project root with:
```
MONGO_URI=mongodb://localhost:27017/improve-my-city
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DEV_ADMIN_KEY=dev-key-123
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
PORT=3000
```

## Database Initialization

1. Make sure MongoDB is running
2. Run the seed script to create test data:
```bash
npm run seed
```

## Test Credentials
- **Email**: admin@city.gov.in
- **Password**: admin123

## Verification

1. Start the development server: `npm run dev`
2. Navigate to: http://localhost:3000/authority/login
3. Use the test credentials to login
4. You should be redirected to the authority dashboard
