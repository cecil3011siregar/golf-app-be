import { Image } from '#/image/entities/image.entity';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityNotFoundError,
  Not,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { CreateSportTypeDto } from './dto/create-sport-type.dto';
import { UpdateSportTypeDto } from './dto/update-sport-type.dto';
import { SportType } from './entities/sport-type.entity';

@Injectable()
export class SportTypeService {
  constructor(
    @InjectRepository(SportType)
    private readonly sportTypeRepository: Repository<SportType>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async create(createSportTypeDto: CreateSportTypeDto) {
    try {
      const { name } = createSportTypeDto;

      // Find sport type by name
      const sportType = await this.sportTypeRepository.findOne({
        where: { name },
      });

      // Throw error if sport type already exists
      if (sportType) {
        throw new ConflictException('Sport type already exists');
      }

      // Create new sport type
      const newSportType = new SportType();
      newSportType.name = name;

      const insertResult = await this.sportTypeRepository.insert(newSportType);

      const newImage = new Image();
      newImage.filename = createSportTypeDto.image;
      newImage.sportType = newSportType;
      await this.imageRepository.insert(newImage);

      return await this.sportTypeRepository.findOneOrFail({
        where: { id: insertResult.identifiers[0].id },
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Created sport type not found');
      }

      throw error;
    }
  }

  async findAll() {
    try {
      const data = await this.sportTypeRepository.find({
        relations: ['image'],
      });

      const result = data.map((sportType) => {
        if (sportType.image) {
          return { ...sportType, image: sportType.image.filename };
        }

        return sportType;
      });

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong while fetching sport types.',
      );
    }
  }

  async findOne(id: string) {
    try {
      return await this.sportTypeRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Sport type not found');
      }

      throw error;
    }
  }

  async update(id: string, updateSportTypeDto: UpdateSportTypeDto) {
    try {
      const sportType = await this.findOne(id);

      // Check if there is a sport type with the same name except the one being updated
      const sportTypeWithSameName = await this.sportTypeRepository.findOne({
        where: { name: updateSportTypeDto.name, id: Not(id) },
      });

      if (sportTypeWithSameName) {
        throw new ConflictException('Sport type already exists');
      }

      sportType.name = updateSportTypeDto.name;

      await this.sportTypeRepository.update(id, sportType);

      if (updateSportTypeDto.image) {
        const image = await this.imageRepository.findOne({
          where: { sportType: { id } },
        });

        if (image) {
          image.filename = updateSportTypeDto.image;
          await this.imageRepository.update(image.id, image);
        } else {
          const newImage = new Image();
          newImage.filename = updateSportTypeDto.image;
          newImage.sportType = sportType;
          await this.imageRepository.insert(newImage);
        }
      }

      return await this.findOne(id);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(
          'Something went wrong while updating sport type.',
        );
      }

      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);

      await this.sportTypeRepository.softDelete(id);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(
          'Something went wrong while updating sport type.',
        );
      }

      throw error;
    }
  }
}
