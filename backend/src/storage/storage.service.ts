import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/index.js';

export interface UploadResult {
  filename: string;
  originalFilename: string;
  filePath: string;
  fileSizeBytes: number;
  mimeType: string;
}

export class StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = config.storage.uploadDir;
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Save uploaded file buffer to private storage
   */
  async saveFile(
    buffer: Buffer,
    originalFilename: string,
    mimeType: string
  ): Promise<UploadResult> {
    const ext = path.extname(originalFilename).toLowerCase();
    const uniqueId = crypto.randomUUID();
    const safeFilename = `${uniqueId}${ext}`;
    const targetPath = path.join(this.uploadDir, safeFilename);

    await fs.promises.writeFile(targetPath, buffer);

    return {
      filename: safeFilename,
      originalFilename,
      filePath: targetPath,
      fileSizeBytes: buffer.length,
      mimeType,
    };
  }

  /**
   * Get file stream / path for reading
   */
  getFilePath(filenameOrPath: string): string {
    const basename = path.basename(filenameOrPath);
    const resolved = path.join(this.uploadDir, basename);
    if (!fs.existsSync(resolved)) {
      throw new Error('File not found in storage');
    }
    return resolved;
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filenameOrPath: string): Promise<boolean> {
    try {
      const basename = path.basename(filenameOrPath);
      const resolved = path.join(this.uploadDir, basename);
      if (fs.existsSync(resolved)) {
        await fs.promises.unlink(resolved);
      }
      return true;
    } catch {
      return false;
    }
  }
}

export const storageService = new StorageService();
