import { Image } from '#/image/entities/image.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportType } from './entities/sport-type.entity';
import { SportTypeController } from './sport-type.controller';
import { SportTypeService } from './sport-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([SportType, Image])],
  controllers: [SportTypeController],
  providers: [SportTypeService],
  exports: [SportTypeService],
})
export class SportTypeModule {}
