export const config = {
  mongodb: {
    uri: process.env.MONGO_URI || "YOUR_MONGO_URI",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "dev-secret",
    devAdminKey: process.env.DEV_ADMIN_KEY || "dev-key",
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
