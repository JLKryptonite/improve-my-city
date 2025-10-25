import Complaint from "../models/Complaint.js";

export async function mergeComplaints(
        primaryId: string,
        duplicateId: string,
        actorNote?: string
) {
        if (primaryId === duplicateId)
                throw new Error("Cannot merge complaint into itself");
        const [primary, dup] = await Promise.all([
                Complaint.findById(primaryId),
                Complaint.findById(duplicateId),
        ]);
        if (!primary || !dup) throw new Error("Complaint not found");

        // Append media & timeline from duplicate
        primary.photos_before.push(...(dup.photos_before || []));
        primary.photos_progress.push(...(dup.photos_progress || []));
        primary.related_ids = Array.from(
                new Set([
                        ...(primary.related_ids || []),
                        dup._id.toString(),
                        ...(dup.related_ids || []),
                ])
        );
        primary.timeline.push({
                ts: new Date(),
                type: "work_update",
                actor: "official",
                note: `Merged duplicate ${dup._id}${
                        actorNote ? ": " + actorNote : ""
                }`,
        } as any);

        await primary.save();
        await Complaint.deleteOne({ _id: dup._id });

        return primary;
}

export function metersToDegrees(m: number) {
        return m / 111_320; // approx
}

export async function findNearbySimilarComplaints(
        category: string,
        lat: number,
        lng: number,
        radiusM: number,
        maxAgeDays = 180
) {
        const radiusDeg = metersToDegrees(radiusM);
        const since = new Date(Date.now() - maxAgeDays * 86400_000);
        return Complaint.find({
                category,
                created_at: { $gte: since },
                location: {
                        $geoWithin: {
                                $centerSphere: [
                                        [lng, lat],
                                        (radiusDeg / 111_320) * 111_320,
                                ], // leave as deg; using metersToDegrees is enough
                        },
                },
                status: {
                        $in: ["pending", "in_progress", "stalled", "revived"],
                },
        }).limit(5);
}

export async function appendNoProgressUpdate(
        primaryId: string,
        imageUrls: string[]
) {
        const c = await Complaint.findById(primaryId);
        if (!c) throw new Error("Complaint not found");
        // Throttle: enforce cadence based on age
        const now = new Date();
        const ageDays = Math.floor(
                (now.getTime() - c.created_at.getTime()) / 86400_000
        );
        const minGapDays = ageDays <= 30 ? 7 : ageDays <= 60 ? 3 : 1;
        const lastNoProgress = [...(c.timeline || [])]
                .reverse()
                .find((e) => e.type === "no_progress_update");
        if (lastNoProgress) {
                const gapDays =
                        (now.getTime() -
                                new Date(lastNoProgress.ts).getTime()) /
                        86400_000;
                if (gapDays < minGapDays)
                        throw new Error(
                                `Please wait ${Math.ceil(
                                        minGapDays - gapDays
                                )} more day(s) before adding another update.`
                        );
        }
        c.timeline.push({
                ts: now,
                type: "no_progress_update",
                actor: "public",
                images: imageUrls,
        } as any);
        c.photos_before.push(...imageUrls); // keep evidence
        c.last_activity_at = now;
        await c.save();
        return c;
}
