import mongoose from "mongoose";
import app from "./app.js";
import { CONFIG } from "./config.js";

async function main() {
        await mongoose.connect(CONFIG.MONGO_URI);
        app.listen(CONFIG.PORT, () => {
                console.log(`API listening on http://localhost:${CONFIG.PORT}`);
        });
}
main().catch((err) => {
        console.error("Fatal startup error:", err);
        process.exit(1);
});
