export const config = {
  mongodb: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017/improve-my-city",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production",
    devAdminKey: process.env.DEV_ADMIN_KEY || "dev-key-123",
  },
  app: {
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    nextAuthSecret: process.env.NEXTAUTH_SECRET || "your-nextauth-secret",
    nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
  },
  business: {
    stalledAfterDays: 60,
    defaultProgressDeadlineDays: 30,
  },
};
