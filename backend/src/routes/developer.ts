import { Router } from "express";
import { requireDevKey } from "../auth/devApiKey.js";
import Complaint from "../models/Complaint.js";
import { runOverdueSweep } from "../services/statusEngine.js";

const r = Router();
r.use(requireDevKey);

r.post("/jobs/overdue-sweep", async (_req, res) => {
        await runOverdueSweep();
        res.json({ ok: true });
});

// add more developer-only admin ops here (category config, SLA edits, etc.)

export default r;
