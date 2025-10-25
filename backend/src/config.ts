import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
        PORT: Number(process.env.PORT || 4000),
        MONGO_URI: process.env.MONGO_URI || "YOUR_MONGO_URI",
        JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
        DEV_ADMIN_KEY: process.env.DEV_ADMIN_KEY || "dev-key",
        STALLED_AFTER_DAYS: 60,
        DEFAULT_PROGRESS_DEADLINE_DAYS: 30,
};
