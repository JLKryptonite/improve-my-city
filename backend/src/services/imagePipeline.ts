import sharp from "sharp";
import { extract } from "exifr";

export type MinimalExif = {
        gps?: { lat: number; lng: number };
        takenAt?: Date;
};

export async function extractMinimalExif(buf: Buffer): Promise<MinimalExif> {
        try {
                const data: any = await extract(buf, {
                        tiff: true,
                        ifd0: true,
                        exif: true,
                        gps: true,
                });
                const gps =
                        data?.gps ||
                        (data?.GPSLatitude && data?.GPSLongitude
                                ? {
                                          lat: data.GPSLatitude,
                                          lng: data.GPSLongitude,
                                  }
                                : undefined);
                const takenAt = data?.DateTimeOriginal
                        ? new Date(data.DateTimeOriginal)
                        : undefined;
                return { gps, takenAt };
        } catch {
                return {};
        }
}

export async function stripAndCompress(buf: Buffer): Promise<Buffer> {
        // Remove metadata & lightly compress to keep bandwidth low
        return await sharp(buf)
                .rotate()
                .jpeg({ quality: 80, chromaSubsampling: "4:2:0" })
                .withMetadata({ exif: undefined })
                .toBuffer();
}
