import { Module } from '@nestjs/common';
import { BenefitService } from './benefit.service';
import { BenefitController } from './benefit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Benefit } from './entities/benefit.entity';
import { Image } from '#/image/entities/image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Benefit, Image]),
  ],
  controllers: [BenefitController],
  providers: [BenefitService],
})
export class BenefitModule {}
