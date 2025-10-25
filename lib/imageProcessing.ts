import sharp from 'sharp';
import exifr from 'exifr';

export interface ExifData {
  gps?: {
    lat: number;
    lng: number;
  };
  takenAt?: Date;
}

export async function extractMinimalExif(buffer: Buffer): Promise<ExifData> {
  try {
    const exif = await exifr.parse(buffer, {
      gps: true,
      pick: ['GPSLatitude', 'GPSLongitude', 'DateTimeOriginal', 'CreateDate'],
    });

    const result: ExifData = {};

    if (exif.GPSLatitude && exif.GPSLongitude) {
      const lat = exif.GPSLatitude;
      const lng = exif.GPSLongitude;
      result.gps = {
        lat: lat[0] + lat[1] / 60 + lat[2] / 3600,
        lng: lng[0] + lng[1] / 60 + lng[2] / 3600,
      };

      // Handle GPS reference (N/S, E/W)
      if (exif.GPSLatitudeRef === 'S') result.gps.lat = -result.gps.lat;
      if (exif.GPSLongitudeRef === 'W') result.gps.lng = -result.gps.lng;
    }

    if (exif.DateTimeOriginal) {
      result.takenAt = new Date(exif.DateTimeOriginal);
    } else if (exif.CreateDate) {
      result.takenAt = new Date(exif.CreateDate);
    }

    return result;
  } catch (error) {
    console.error('Error extracting EXIF:', error);
    return {};
  }
}

export async function stripAndCompress(buffer: Buffer): Promise<Buffer> {
  try {
    // Use Sharp to process the image
    const processedBuffer = await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
        progressive: true,
        mozjpeg: true,
      })
      .toBuffer();

    return processedBuffer;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'Image size must be less than 10MB' };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  return { valid: true };
}

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
