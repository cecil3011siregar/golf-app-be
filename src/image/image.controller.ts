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
  @Post('upload')
  @UseInterceptors(FileInterceptor('image', uploadImage()))
  upload(@UploadedFile() image: Express.Multer.File) {
    if (typeof image === 'undefined') {
      throw new BadRequestException('Image is not uploaded');
    }

    return {
      filename: image.filename,
    };
  }
}
