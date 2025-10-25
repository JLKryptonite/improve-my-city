import Complaint from "../models/Complaint.js";
import { CONFIG } from "../config.js";

function accumulatedHoldBetween(_c: any, _from: Date, _to: Date) {
        // TODO compute overlap of holds with [from,to]
        return 0;
}

export async function runOverdueSweep() {
        const now = new Date();
        const open = await Complaint.find({ status: { $ne: "resolved" } });
        for (const c of open) {
                if (!c.first_progress_at) {
                        const age = now.getTime() - c.created_at.getTime();
                        if (
                                age >= CONFIG.STALLED_AFTER_DAYS * 86400_000 &&
                                c.status !== "stalled"
                        ) {
                                c.status = "stalled";
                                c.stalled_since = c.stalled_since || now;
                                c.timeline.push({
                                        ts: now,
                                        type: "stalled_auto",
                                        actor: "system",
                                        note: "no_progress_60d",
                                } as any);
                                c.last_activity_at = now;
                                await c.save();
                        }
                } else {
                        // progress-based deadline
                        const deadlineDays =
                                c.progress_deadline_days ||
                                CONFIG.DEFAULT_PROGRESS_DEADLINE_DAYS;
                        const elapsed =
                                now.getTime() -
                                c.first_progress_at.getTime() -
                                accumulatedHoldBetween(
                                        c,
                                        c.first_progress_at,
                                        now
                                );
                        if (
                                elapsed >= deadlineDays * 86400_000 &&
                                c.status !== "stalled" &&
                                c.status !== "revived"
                        ) {
                                c.status = "stalled";
                                c.stalled_since = c.stalled_since || now;
                                c.timeline.push({
                                        ts: now,
                                        type: "stalled_auto",
                                        actor: "system",
                                        note: "missed_progress_deadline",
                                } as any);
                                c.last_activity_at = now;
                                await c.save();
                        }
                }

                // Revived back to stalled if no progress for 60d
                if (c.status === "revived" && c.revived_since) {
                        const age =
                                now.getTime() - c.last_activity_at.getTime();
                        if (age >= CONFIG.STALLED_AFTER_DAYS * 86400_000) {
                                c.status = "stalled";
                                c.stalled_since = c.stalled_since || now;
                                c.timeline.push({
                                        ts: now,
                                        type: "stalled_auto",
                                        actor: "system",
                                        note: "revived_no_updates_60d",
                                } as any);
                                c.last_activity_at = now;
                                await c.save();
                        }
                }
        }
}
