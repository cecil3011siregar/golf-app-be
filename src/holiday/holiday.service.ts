import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Holiday } from './entities/holiday.entity';
import { EntityNotFoundError, QueryFailedError, Repository } from 'typeorm';
import { Benefit } from '#/benefit/entities/benefit.entity';
import { Place } from '#/place/entities/place.entity';

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
    @InjectRepository(Benefit)
    private readonly benefitRepository: Repository<Benefit>,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
  ) {}

  async create(createHolidayDto: CreateHolidayDto) {
    try {
      const benefits = await Promise.all(
        createHolidayDto.benefits.map(async (benefitName) => {
          let benefit = await this.benefitRepository.findOne({
            where: { name: benefitName },
          });
  
          if (!benefit) {
            benefit = this.benefitRepository.create({ name: benefitName });
            await this.benefitRepository.save(benefit);
          }
  
          return benefit;
        })
      );

      const holiday = this.holidayRepository.create({
        name: createHolidayDto.title,
        price: createHolidayDto.price,
        description: createHolidayDto.description,
        duration: createHolidayDto.duration,
        benefit: benefits,
      });
      await this.holidayRepository.save(holiday);

      const placeVisits = createHolidayDto.places.map((placeName) => 
        this.placeRepository.create({ 
          name: placeName, 
          holidayId: holiday.id 
        })
      );
      await this.placeRepository.save(placeVisits);

      return await this.holidayRepository.findOneOrFail({
        where: { id: holiday.id },
        relations: ['place', 'benefit'],
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

  findAll() {
    return `This action returns all holiday`;
  }

  async findOne(id: string) {
    try {
      return await this.holidayRepository.findOneOrFail({
        where: { id },
        relations: ['place', 'benefit'],
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException();
      }
      throw new InternalServerErrorException();
    }
  }

  async update(id: string, updateHolidayDto: UpdateHolidayDto) {
    try {
      const holiday = await this.holidayRepository.findOneOrFail({
        where: { id },
        relations: ['place', 'benefit'],
      });

      const benefits = await Promise.all(
        updateHolidayDto.benefits.map(async (benefitName) => {
          let benefit = await this.benefitRepository.findOne({
            where: { name: benefitName },
          });
  
          if (!benefit) {
            benefit = this.benefitRepository.create({ name: benefitName });
            await this.benefitRepository.save(benefit);
          }
  
          return benefit;
        })
      );

      const updatedHoliday = this.holidayRepository.create({
        ...holiday,
        name: updateHolidayDto.title,
        price: updateHolidayDto.price,
        description: updateHolidayDto.description,
        duration: updateHolidayDto.duration,
        benefit: benefits,
      });
      await this.holidayRepository.save(updatedHoliday);

      const existingPlaces = holiday.place.map(p => p.name);
      
      const newPlaceNames = updateHolidayDto.places.filter(
        placeName => !existingPlaces.includes(placeName)
      );
      const newPlaces = newPlaceNames.map(
        placeName => this.placeRepository.create({ 
          name: placeName, 
          holidayId: updatedHoliday.id 
        })
      );
      
      const placesToRemove = holiday.place.filter(
        place => !updateHolidayDto.places.includes(place.name)
      );
      
      if (placesToRemove.length > 0) {
        await this.placeRepository.softRemove(placesToRemove);
      }

      if (newPlaces.length > 0) {
        await this.placeRepository.save(newPlaces);
      }

      return await this.holidayRepository.findOneOrFail({
        where: { id },
        relations: ['place', 'benefit'],
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
      await this.holidayRepository.findOneOrFail({
        where: { id },
      });

      await this.holidayRepository.softDelete(id);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException();
      }
      throw new InternalServerErrorException();
    }
  }
}
