import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportType } from './entities/sport-type.entity';
import { SportTypeController } from './sport-type.controller';
import { SportTypeService } from './sport-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([SportType])],
  controllers: [SportTypeController],
  providers: [SportTypeService],
})
export class SportTypeModule {}