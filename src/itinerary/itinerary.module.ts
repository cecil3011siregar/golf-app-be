import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Itinerary } from './entities/itinerary.entity';
import { ItineraryController } from './itinerary.controller';
import { ItineraryService } from './itinerary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Itinerary])],
  controllers: [ItineraryController],
  providers: [ItineraryService],
})
export class ItineraryModule {}
