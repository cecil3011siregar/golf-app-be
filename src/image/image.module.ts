import { GoogleDriveModule } from '#/google-drive/google-drive.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { ImageController } from './image.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Image]), GoogleDriveModule],
  controllers: [ImageController],
})
export class ImageModule {}
