import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import { drive_v3, google } from 'googleapis';

@Injectable()
export class GoogleDriveService {
  private drive: drive_v3.Drive;

  constructor(private configService: ConfigService) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        project_id: this.configService.get<string>('google.projectId'),
        private_key: this.configService
          .get<string>('google.privateKey')
          .replace(/\\n/g, '\n'),
        client_email: this.configService.get<string>('google.clientEmail'),
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.drive = google.drive({ version: 'v3', auth });
  }

  async uploadFile(file: Express.Multer.File) {
    try {
      const response = await this.drive.files.create({
        requestBody: {
          name: file.filename,
          mimeType: file.mimetype,
          parents: [this.configService.get<string>('google.folderId')],
        },
        media: {
          mimeType: file.mimetype,
          body: createReadStream(file.path),
        },
      });

      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      return `https://drive.google.com/uc?id=${response.data.id}`;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
