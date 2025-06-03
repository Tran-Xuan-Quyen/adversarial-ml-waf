import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { Readable } from 'stream';
import * as path from 'path';

@Injectable()
export class GoogleDriveService {
  private drive;

  constructor() {
    try {
      // Use credentials.json file
      const auth = new google.auth.GoogleAuth({
        keyFile: path.join(process.cwd(), 'credentials.json'),
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });

      this.drive = google.drive({ version: 'v3', auth });

      console.log('[P]:::Drive instance initialized successfully');
    } catch (error) {
      console.error('[P]:::Error initializing Google Drive:', error);
      throw error;
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      const fileMetadata = {
        name: file.originalname,
        parents: ['1eHTpIygIR6HBYCdBz2jAIq5vvyVnLQqG'],
      };

      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);

      const media = {
        mimeType: file.mimetype,
        body: bufferStream,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
      });

      return response.data.webViewLink;
    } catch (error) {
      console.error('[P]:::Google Drive Error:', error);
      throw new Error(
        `Failed to upload file to Google Drive: ${error.message}`,
      );
    }
  }
}
