import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Benefit } from './entities/benefit.entity';
import { EntityNotFoundError, QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class BenefitService {
  constructor(
    @InjectRepository(Benefit)
    private readonly benefitRepository: Repository<Benefit>,
  ) {}

  async create(createBenefitDto: CreateBenefitDto) {
    try {
      const result = await this.benefitRepository.insert(createBenefitDto);

      return await this.benefitRepository.findOneOrFail({
        where: {
          id: result.identifiers[0].id,
        },
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException();
      }
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException();
      }
      throw new InternalServerErrorException();
    }
  }

  async findAll() {
    return await this.benefitRepository.find({
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    try {
      return await this.benefitRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException();
      }
      throw new InternalServerErrorException();
    }
  }

  async update(id: string, updateBenefitDto: UpdateBenefitDto) {
    try {
      await this.benefitRepository.findOneOrFail({
        where: { id },
      });

      await this.benefitRepository.update(id, updateBenefitDto);
      return await this.benefitRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException();
      }
      if (error instanceof QueryFailedError) {
        throw new BadRequestException();
      }
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string) {
    try {
      await this.benefitRepository.findOneOrFail({
        where: { id },
      });

      await this.benefitRepository.softDelete(id);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException();
      }
      throw new InternalServerErrorException();
    }
  }
}
