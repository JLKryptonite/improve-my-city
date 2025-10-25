export type MinimalExif = {
        gps?: { lat: number; lng: number };
        takenAt?: Date;
};

export async function extractMinimalExif(_buf: Buffer): Promise<MinimalExif> {
        // TODO: implement with exifr or sharp pipeline
        return {};
}

export function validateExifAgainstLocation(
        exif: MinimalExif,
        lat: number,
        lng: number,
        accuracyM: number
) {
        if (!exif.gps) return { ok: true, reason: "no-exif-gps" }; // be lenient
        const R = Math.min(Math.max(accuracyM * 2, 25), 150);
        const dMeters = haversineMeters(exif.gps.lat, exif.gps.lng, lat, lng);
        if (dMeters > 1000) return { ok: false, reason: "exif-too-far" };
        if (dMeters > R) return { ok: false, reason: "exif-outside-radius" };
        return { ok: true };
}

export function validateExifRecency(exif: MinimalExif, maxAgeDays: number) {
        if (!exif.takenAt) return { ok: true, reason: "no-exif-time" };
        const ageMs = Date.now() - exif.takenAt.getTime();
        return { ok: ageMs <= maxAgeDays * 86400_000 };
}

function haversineMeters(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
) {
        const R = 6371000; // m
        const toRad = (d: number) => (d * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) *
                        Math.cos(toRad(lat2)) *
                        Math.sin(dLon / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(a));
}
