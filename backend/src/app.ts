import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import publicRoutes from "./routes/public.js";
import authorityRoutes from "./routes/authority.js";
import developerRoutes from "./routes/developer.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.use("/api", publicRoutes);
app.use("/api/authority", authorityRoutes);
app.use("/api/developer", developerRoutes);

app.use(errorHandler);
export default app;
