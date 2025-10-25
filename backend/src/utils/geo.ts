export function metersToDegrees(m: number) {
        // Approx conversion for small distances near equator
        return m / 111_320; // ~ meters per degree
}
