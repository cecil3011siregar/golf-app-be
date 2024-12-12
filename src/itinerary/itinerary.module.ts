import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Itinerary } from './entities/itinerary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Itinerary])],
  controllers: [],
  providers: [],
})
export class ItineraryModule {}
