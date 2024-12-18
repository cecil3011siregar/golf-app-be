import { Holiday } from '#/holiday/entities/holiday.entity';
import { SportType } from '#/sport-type/entities/sport-type.entity';
import { Sport } from '#/sport/entities/sport.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sport, SportType, Holiday])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
