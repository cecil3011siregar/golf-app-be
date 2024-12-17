import { GoogleDriveService } from '#/google-drive/google-drive.service';
import { uploadImage } from '#/utils/upload';
import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('images')
export class ImageController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image', uploadImage()))
  async upload(@UploadedFile() image: Express.Multer.File) {
    if (typeof image === 'undefined') {
      throw new BadRequestException('Image is not uploaded');
    }

    const url = await this.googleDriveService.uploadFile(image);

    return {
      filename: url,
    };
  }
}
