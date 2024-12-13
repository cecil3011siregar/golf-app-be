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
import { Image } from '#/image/entities/image.entity';

@Injectable()
export class BenefitService {
  constructor(
    @InjectRepository(Benefit)
    private readonly benefitRepository: Repository<Benefit>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async create(createBenefitDto: CreateBenefitDto) {
    try {
      const benefit = this.benefitRepository.create({
        name: createBenefitDto.name,
      });
      await this.benefitRepository.save(benefit);

      if (createBenefitDto.image) {
        const image = this.imageRepository.create({
          filename: createBenefitDto.image,
          benefitId: benefit.id,
        });
        await this.imageRepository.save(image);
      }

      return await this.benefitRepository.findOneOrFail({
        where: {
          id: benefit.id,
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
      const benefit = await this.benefitRepository.findOneOrFail({
        where: { id },
      });

      const image = await this.imageRepository.findOne({
        where: { benefitId: id },
      });

      const updatedBenefit = await this.benefitRepository.create({
        ...benefit,
        name: updateBenefitDto.name,
      })
      await this.benefitRepository.save(updatedBenefit);

      if (updateBenefitDto.image) {
        if (image) {
          image.filename = updateBenefitDto.image;
          await this.imageRepository.save(image);
        } else {
          const image = this.imageRepository.create({
            filename: updateBenefitDto.image,
            benefitId: id,
          });
          await this.imageRepository.save(image);
        }
      }

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
