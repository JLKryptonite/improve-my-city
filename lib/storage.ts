import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// For development, we'll store images in the public/uploads directory
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
async function ensureUploadDir(): Promise<void> {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function storeImage(buffer: Buffer): Promise<string> {
  await ensureUploadDir();

  // Generate a unique filename
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const extension = 'jpg'; // Since we're converting to JPEG
  const filename = `${hash}.${extension}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // Save the file
  await fs.writeFile(filepath, buffer);

  // Return the public URL
  return `/uploads/${filename}`;
}

export async function deleteImage(imageUrl: string): Promise<void> {
  if (!imageUrl.startsWith('/uploads/')) {
    return; // Not a local file
  }

  const filename = path.basename(imageUrl);
  const filepath = path.join(UPLOAD_DIR, filename);

  try {
    await fs.unlink(filepath);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - deletion failure shouldn't break the main flow
  }
}

export async function getImagePath(imageUrl: string): Promise<string | null> {
  if (!imageUrl.startsWith('/uploads/')) {
    return null; // Not a local file
  }

  const filename = path.basename(imageUrl);
  const filepath = path.join(UPLOAD_DIR, filename);

  try {
    await fs.access(filepath);
    return filepath;
  } catch {
    return null;
  }
}
