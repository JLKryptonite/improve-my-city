import mongoose from "mongoose";

const TimelineEventSchema = new mongoose.Schema(
        {
                ts: { type: Date, required: true },
                type: { type: String, required: true },
                note: String,
                actor: {
                        type: String,
                        enum: ["public", "official", "system"],
                        required: true,
                },
                images: [String],
                reason: String,
        },
        { _id: false }
);

const ComplaintSchema = new mongoose.Schema({
        category: { type: String, required: true },
        location: {
                type: { type: String, enum: ["Point"], default: "Point" },
                coordinates: { type: [Number], required: true },
        },
        state: String,
        city: String,
        ward: String,
        status: {
                type: String,
                enum: [
                        "pending",
                        "in_progress",
                        "stalled",
                        "revived",
                        "resolved",
                ],
                default: "pending",
        },
        created_at: { type: Date, default: () => new Date() },
        first_progress_at: Date,
        progress_deadline_days: { type: Number, default: 60 },
        hold_periods: [
                {
                        start: Date,
                        expected_resume_at: Date,
                        end: Date,
                        reason: String,
                },
        ],
        accumulated_hold_seconds: { type: Number, default: 0 },
        stalled_since: Date,
        revived_since: Date,
        last_activity_at: { type: Date, default: () => new Date() },
        assigned: { dept_id: String, contractor_id: String, due: Date },
        photos_before: [String],
        photos_progress: [String],
        photos_after: [String],
        related_ids: [String],
        timeline: [TimelineEventSchema],
});

ComplaintSchema.index({ location: "2dsphere" });
ComplaintSchema.index({ status: 1, state: 1, city: 1, category: 1 });
ComplaintSchema.index({ created_at: 1 });
ComplaintSchema.index({ stalled_since: 1, revived_since: 1 });

export default mongoose.model("Complaint", ComplaintSchema);
