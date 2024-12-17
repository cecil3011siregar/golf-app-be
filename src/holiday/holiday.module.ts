import { Benefit } from '#/benefit/entities/benefit.entity';
import { GoogleDriveModule } from '#/google-drive/google-drive.module';
import { Image } from '#/image/entities/image.entity';
import { Itinerary } from '#/itinerary/entities/itinerary.entity';
import { Place } from '#/place/entities/place.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holiday } from './entities/holiday.entity';
import { HolidayController } from './holiday.controller';
import { HolidayService } from './holiday.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Holiday, Benefit, Place, Itinerary, Image]),
    GoogleDriveModule,
  ],
  controllers: [HolidayController],
  providers: [HolidayService],
})
export class HolidayModule {}
