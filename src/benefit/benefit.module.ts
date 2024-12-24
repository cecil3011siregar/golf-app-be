import { GoogleDriveModule } from '#/google-drive/google-drive.module';
import { Image } from '#/image/entities/image.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefitController } from './benefit.controller';
import { BenefitService } from './benefit.service';
import { Benefit } from './entities/benefit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Benefit, Image]), GoogleDriveModule],
  controllers: [BenefitController],
  providers: [BenefitService],
})
export class BenefitModule {}
