export type Status =
        | "pending"
        | "in_progress"
        | "stalled"
        | "revived"
        | "resolved";

export interface HoldPeriod {
        start: string; // ISO
        expected_resume_at: string; // ISO
        end?: string; // ISO
        reason: string;
}

export interface LocationPoint {
        type: "Point";
        coordinates: [number, number];
}

export interface Complaint {
        _id: string;
        category: string;
        location: LocationPoint;
        state: string;
        city: string;
        ward?: string;
        status: Status;
        created_at: string;
        first_progress_at?: string;
        progress_deadline_days?: number; // default 60
        hold_periods: HoldPeriod[];
        accumulated_hold_seconds: number;
        stalled_since?: string;
        revived_since?: string;
        last_activity_at: string;
        assigned?: { dept_id?: string; contractor_id?: string; due?: string };
}

export interface TimelineEvent {
        ts: string;
        type:
                | "submitted"
                | "assign"
                | "progress_started"
                | "work_update"
                | "work_on_hold"
                | "work_resume"
                | "stalled_auto"
                | "revived_on_progress"
                | "escalated_l1"
                | "resolved"
                | "no_progress_update";
        note?: string;
        actor: "public" | "official" | "system";
        images?: string[];
        reason?: string;
}
