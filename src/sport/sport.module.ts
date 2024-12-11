import { Image } from '#/image/entities/image.entity';
import { SportTypeModule } from '#/sport-type/sport-type.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sport } from './entities/sport.entity';
import { SportController } from './sport.controller';
import { SportService } from './sport.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sport, Image]), SportTypeModule],
  controllers: [SportController],
  providers: [SportService],
})
export class SportModule {}
