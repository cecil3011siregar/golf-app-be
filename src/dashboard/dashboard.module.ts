import { Benefit } from '#/benefit/entities/benefit.entity';
import { GoogleDriveModule } from '#/google-drive/google-drive.module';
import { Holiday } from '#/holiday/entities/holiday.entity';
import { Image } from '#/image/entities/image.entity';
import { SportType } from '#/sport-type/entities/sport-type.entity';
import { Sport } from '#/sport/entities/sport.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sport, SportType, Holiday, Image, Benefit]),
    GoogleDriveModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
