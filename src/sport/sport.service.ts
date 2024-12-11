import { SportTypeService } from '#/sport-type/sport-type.service';
import { PaginationDto } from '#/utils/pagination';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
        relations: ['sportType', 'images'],
      });

      const totalPages = Math.ceil(totalItems / limit);

      return {
        data,
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
      return await this.sportRepository.findOneOrFail({
        where: { id },
        relations: ['sportType', 'images', 'itineraries'],
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Sport holiday not found');
      }

      throw error;
    }
  }

  async update(id: string, updateSportDto: UpdateSportDto) {
    try {
      const sport = await this.sportRepository.findOneOrFail({
        where: { id },
      });

      if (updateSportDto.sportTypeId) {
        const sportType = await this.sportTypeService.findOne(
          updateSportDto.sportTypeId,
        );

        sport.sportType = sportType;
      }
      sport.title = updateSportDto.title;
      sport.price = updateSportDto.price;
      sport.description = updateSportDto.description;
      sport.city = updateSportDto.city;
      sport.location = updateSportDto.location;
      sport.duration = updateSportDto.duration;

      await this.sportRepository.update(id, sport);

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
      await this.findOne(id);

      await this.sportRepository.softDelete(id);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(
          'Something went wrong while deleting sport holiday.',
        );
      }

      throw error;
    }
  }
}
