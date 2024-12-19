import { GoogleDriveService } from '#/google-drive/google-drive.service';
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
  Between,
  EntityNotFoundError,
  FindOptionsWhere,
  ILike,
  Not,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { CreateSportDto } from './dto/create-sport.dto';
import { SportQueryDto, SportSort, Status } from './dto/query.dto';
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
    private readonly googleDriveService: GoogleDriveService,
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
      newSportHoliday.status = createSportDto.status;

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
      const { sort, type, search, status } = queryDto;
      const offset = (page - 1) * limit;
      const whereClause: FindOptionsWhere<Sport>[] = [];
      const sortClause: Record<string, 'ASC' | 'DESC'> = {};

      // Filter by sport type
      if (type) {
        whereClause.push({ sportType: { name: ILike(`%${type}%`) } });
      }

      // Search by title or city
      if (search) {
        whereClause.push(
          { title: ILike(`%${search}%`) },
          { city: ILike(`%${search}%`) },
          { location: ILike(`%${search}%`) },
        );
      }

      // Sorting
      if (sort) {
        switch (sort) {
          case SportSort.AZ:
            sortClause.title = 'ASC';
            break;
          case SportSort.ZA:
            sortClause.title = 'DESC';
            break;
          case SportSort.LOWEST_PRICE:
            sortClause.price = 'ASC';
            break;
          case SportSort.HIGHEST_PRICE:
            sortClause.price = 'DESC';
            break;
          default:
            break;
        }
      }

      if (status) {
        if (status === Status.ACTIVE) {
          whereClause.push({ status: true });
        } else if (status === Status.INACTIVE) {
          whereClause.push({ status: false });
        }
      }

      // Query database
      const [data, totalItems] = await this.sportRepository.findAndCount({
        where: whereClause.length > 0 ? whereClause : undefined,
        order: sortClause,
        take: limit,
        skip: offset,
        relations: ['sportType'],
      });

      // Fetch first image for each sport
      const result = await Promise.all(
        data.map(async (sport) => {
          const firstImage = await this.imageRepository.findOne({
            where: { sport: { id: sport.id } },
            order: { createdAt: 'ASC' },
          });

          return {
            ...sport,
            image:
              (
                await this.googleDriveService.getFiles([firstImage?.filename])
              )[0] || null,
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

      const imageUrl =
        (await this.googleDriveService.getFiles(
          images.map((i) => i.filename),
        )) || [];

      const recommendations = await this.sportRepository.find({
        where: {
          id: Not(id),
          sportType: {
            id: sportHoliday.sportType.id,
          },
          price: Between(sportHoliday.price * 0.5, sportHoliday.price * 1.5),
        },
        relations: ['sportType'],
        order: {
          price: 'ASC',
          duration: 'ASC',
        },
        take: 4,
      });

      const recommendationsData = await Promise.all(
        recommendations.map(async (recommendation) => {
          const firstImage = await this.imageRepository.findOne({
            where: { sport: { id: recommendation.id } },
            order: { createdAt: 'ASC' },
          });
          return {
            ...recommendation,
            image:
              (
                await this.googleDriveService.getFiles([firstImage?.filename])
              )[0] || null,
          };
        }),
      );

      return {
        ...result,
        images: imageUrl,
        recommendations: recommendationsData,
      };
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
        relations: ['images', 'itineraries'],
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

      await this.sportRepository.save(sportHoliday);

      const existingImages = sportHoliday.images.map((i) => i.filename);

      const newImageNames = updateSportDto.images.filter(
        (imageName) => !existingImages.includes(imageName),
      );
      const newImages = newImageNames.map((imageName) =>
        this.imageRepository.create({
          filename: imageName,
          sport: sportHoliday,
        }),
      );

      const imagesToRemove = sportHoliday.images.filter(
        (image) => !updateSportDto.images.includes(image.filename),
      );

      if (imagesToRemove.length > 0) {
        await this.imageRepository.softRemove(imagesToRemove);
      }

      if (newImages.length > 0) {
        await this.imageRepository.save(newImages);
      }

      const existingItineraries = sportHoliday.itineraries.map((i) => i.day);

      const newItineraryDays = updateSportDto.itineraries.filter(
        (itineraryDay) => !existingItineraries.includes(itineraryDay.day),
      );
      const newItineraries = newItineraryDays.map((itineraryDay) =>
        this.itineraryRepository.create({
          day: itineraryDay.day,
          description: itineraryDay.description,
        }),
      );

      const itinerariesToRemove = sportHoliday.itineraries.filter(
        (itinerary) =>
          !updateSportDto.itineraries.some(
            (updateItinerary) => updateItinerary.day === itinerary.day,
          ),
      );

      if (itinerariesToRemove.length > 0) {
        await this.itineraryRepository.softRemove(itinerariesToRemove);
      }

      const itinerariesToUpdate = sportHoliday.itineraries.filter(
        (itinerary) => {
          const updatedItinerary = updateSportDto.itineraries.find(
            (updateItinerary) => updateItinerary.day === itinerary.day,
          );
          return (
            updatedItinerary &&
            updatedItinerary.description !== itinerary.description
          );
        },
      );

      for (const itinerary of itinerariesToUpdate) {
        const updatedItinerary = updateSportDto.itineraries.find(
          (updateItinerary) => updateItinerary.day === itinerary.day,
        );
        if (updatedItinerary) {
          itinerary.description = updatedItinerary.description;
          await this.itineraryRepository.save(itinerary);
        }
      }

      if (newItineraries.length > 0) {
        await this.itineraryRepository.save(newItineraries);
      }

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

  async toggleStatus(id: string) {
    try {
      const sportHoliday = await this.sportRepository.findOneOrFail({
        where: { id },
      });

      sportHoliday.status = !sportHoliday.status;

      return await this.sportRepository.save(sportHoliday);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Sport holiday not found');
      }
      throw error;
    }
  }
}
