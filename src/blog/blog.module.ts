import { Category } from '#/category/entities/category.entity';
import { GoogleDriveModule } from '#/google-drive/google-drive.module';
import { Image } from '#/image/entities/image.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { Blog } from './entities/blog.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog, Image, Category]),
    GoogleDriveModule,
  ],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
