import { Image } from '#/image/entities/image.entity';
import { Itinerary } from '#/itinerary/entities/itinerary.entity';
import { SportTypeService } from '#/sport-type/sport-type.service';
import { PaginationDto } from '#/utils/pagination';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs/promises';
import {
  EntityNotFoundError,
  ILike,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { CreateSportDto } from './dto/create-sport.dto';
import { SportQueryDto, SportSort } from './dto/query.dto';
import { UpdateSportDto } from './dto/update-sport.dto';
import { Sport } from './entities/sport.entity';

@Injectable()
export class SportService {
  constructor(
    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(Itinerary)
    private readonly itineraryRepository: Repository<Itinerary>,
    private readonly sportTypeService: SportTypeService,
  ) {}

  async create(createSportDto: CreateSportDto) {
    try {
      const sportType = await this.sportTypeService.findOne(
        createSportDto.sportTypeId,
      );

      const newSportHoliday = new Sport();
      newSportHoliday.sportType = sportType;
      newSportHoliday.title = createSportDto.title;
      newSportHoliday.price = createSportDto.price;
      newSportHoliday.description = createSportDto.description;
      newSportHoliday.city = createSportDto.city;
      newSportHoliday.location = createSportDto.location;
      newSportHoliday.duration = createSportDto.duration;

      const insertResult = await this.sportRepository.insert(newSportHoliday);

      createSportDto.images.forEach(async (image) => {
        const newImage = new Image();
        newImage.filename = image;
        newImage.sport = newSportHoliday;
        await this.imageRepository.insert(newImage);
      });

      createSportDto.itineraries.forEach(async (itinerary) => {
        const newItinerary = new Itinerary();
        newItinerary.day = itinerary.day;
        newItinerary.description = itinerary.description;
        newItinerary.sport = newSportHoliday;
        await this.itineraryRepository.insert(newItinerary);
      });

      return await this.sportRepository.findOneOrFail({
        where: { id: insertResult.identifiers[0].id },
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(
          'Something went wrong while creating sport holiday.',
        );
      } else if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Created sport holiday not found');
      }

      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto, queryDto: SportQueryDto) {
    try {
      const { page, limit } = paginationDto;
      const { sort, type } = queryDto;
      const offset = (page - 1) * limit;
      const whereClause = {};
      const sortClause = {};

      if (type) {
        whereClause['sportType'] = {
          name: ILike(`%${type}%`),
        };
      }

      if (sort) {
        switch (sort) {
          case SportSort.AZ:
            sortClause['title'] = 'ASC';
            break;
          case SportSort.ZA:
            sortClause['title'] = 'DESC';
            break;
          case SportSort.LOWEST_PRICE:
            sortClause['price'] = 'ASC';
            break;
          case SportSort.HIGHEST_PRICE:
            sortClause['price'] = 'DESC';
            break;
          default:
            break;
        }
      }

      const [data, totalItems] = await this.sportRepository.findAndCount({
        where: whereClause,
        order: sortClause,
        take: limit,
        skip: offset,
        relations: ['sportType'],
      });

      const result = await Promise.all(
        data.map(async (sportHoliday) => {
          const firstImage = await this.imageRepository.findOne({
            where: { sport: { id: sportHoliday.id } },
            order: { createdAt: 'ASC' },
          });

          if (!firstImage) {
            return {
              ...sportHoliday,
              image: null,
            };
          }

          return {
            ...sportHoliday,
            image: firstImage?.filename,
          };
        }),
      );

      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: result,
        page,
        limit,
        totalPages,
        totalItems,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(
          'Something went wrong while fetching sport holidays data.',
        );
      }
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const sportHoliday = await this.sportRepository.findOneOrFail({
        where: { id },
        relations: ['sportType', 'images', 'itineraries'],
      });

      const { images, ...result } = sportHoliday;

      const imagesName = images.map((image) => image.filename);

      return { ...result, images: imagesName };
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Sport holiday not found');
      }

      throw error;
    }
  }

  async update(id: string, updateSportDto: UpdateSportDto) {
    try {
      const sportHoliday = await this.sportRepository.findOneOrFail({
        where: { id },
      });

      if (updateSportDto.sportTypeId) {
        const sportType = await this.sportTypeService.findOne(
          updateSportDto.sportTypeId,
        );

        sportHoliday.sportType = sportType;
      }
      sportHoliday.title = updateSportDto.title;
      sportHoliday.price = updateSportDto.price;
      sportHoliday.description = updateSportDto.description;
      sportHoliday.city = updateSportDto.city;
      sportHoliday.location = updateSportDto.location;
      sportHoliday.duration = updateSportDto.duration;

      await this.sportRepository.update(id, sportHoliday);

      return await this.sportRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(
          'Something went wrong while updating sport holiday.',
        );
      } else if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Sport holiday not found');
      }

      throw error;
    }
  }

  async remove(id: string) {
    try {
      const sportHoliday = await this.sportRepository.findOneOrFail({
        where: { id },
        relations: ['images'],
      });

      if (sportHoliday.images.length > 0) {
        sportHoliday.images.forEach(async (image) => {
          const imagePath = `./uploads/images/${image.filename}`;
          const fileExists = await fs
            .access(imagePath)
            .then(() => true)
            .catch(() => false);

          if (fileExists) {
            await fs.unlink(imagePath);
          }

          await this.imageRepository.softDelete(image.id);
        });
      }

      await this.sportRepository.softDelete(id);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(
          'Something went wrong while deleting sport holiday.',
        );
      } else if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Sport holiday not found');
      }

      throw error;
    }
  }
}
