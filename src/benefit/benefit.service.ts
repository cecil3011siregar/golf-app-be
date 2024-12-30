import { GoogleDriveService } from '#/google-drive/google-drive.service';
import { Image } from '#/image/entities/image.entity';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, QueryFailedError, Repository } from 'typeorm';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';
import { Benefit } from './entities/benefit.entity';

@Injectable()
export class BenefitService {
  constructor(
    @InjectRepository(Benefit)
    private readonly benefitRepository: Repository<Benefit>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly googleDriveService: GoogleDriveService,
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
          benefit: benefit,
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
    try {
      const benefits = await this.benefitRepository.find({
        relations: ['holiday', 'image'],
        order: {
          updatedAt: 'DESC',
        },
      });

      const formattedBenefits = await Promise.all(
        benefits.map(async ({ holiday, image, ...benefit }) => ({
          ...benefit,
          totalHolidays: holiday.length,
          image: image
            ? (await this.googleDriveService.getFiles([image.filename]))[0]
            : null,
        })),
      );

      return formattedBenefits;
    } catch (error) {
      throw new InternalServerErrorException();
    }
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

      const updatedBenefit = this.benefitRepository.create({
        ...benefit,
        name: updateBenefitDto.name,
      });
      await this.benefitRepository.save(updatedBenefit);

      if (updateBenefitDto.image) {
        const image = await this.imageRepository.findOne({
          where: { benefit: updatedBenefit },
        });

        if (image) {
          image.filename = updateBenefitDto.image;
          await this.imageRepository.save(image);
        } else {
          const image = this.imageRepository.create({
            filename: updateBenefitDto.image,
            benefit: updatedBenefit,
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

  async toogleStatus(id: string) {
    try {
      const benefit = await this.benefitRepository.findOneOrFail({
        where: { id },
      });

      benefit.status = !benefit.status;
      await this.benefitRepository.save(benefit);

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
