import { Module } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { HolidayController } from './holiday.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holiday } from './entities/holiday.entity';
import { Benefit } from '#/benefit/entities/benefit.entity';
import { Place } from '#/place/entities/place.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Holiday, Benefit, Place]),
  ],
  controllers: [HolidayController],
  providers: [HolidayService],
})
export class HolidayModule {}
