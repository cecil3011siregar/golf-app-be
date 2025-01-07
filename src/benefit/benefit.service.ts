import { GoogleDriveService } from '#/google-drive/google-drive.service';
import { Image } from '#/image/entities/image.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
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
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
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

      await this.cacheManager.reset();

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
      const cacheKey = 'benefitsAll';
      const cachedData = await this.cacheManager.get(cacheKey);

      if (cachedData) {
        return cachedData;
      }

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
          image: await this.googleDriveService.getFile(image?.filename),
        })),
      );

      await this.cacheManager.set(cacheKey, formattedBenefits);

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
          where: { benefit: { id } },
        });

        if (image) {
          image.filename = updateBenefitDto.image;
          await this.imageRepository.update(image.id, image);
        } else {
          const newImage = new Image();
          newImage.filename = updateBenefitDto.image;
          newImage.benefit = benefit;
          await this.imageRepository.insert(newImage);
        }
      }

      await this.cacheManager.reset();

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

      await this.cacheManager.reset();

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

      await this.cacheManager.reset();

      await this.benefitRepository.softDelete(id);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException();
      }
      throw new InternalServerErrorException();
    }
  }
}
