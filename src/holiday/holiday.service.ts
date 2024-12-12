import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Holiday } from './entities/holiday.entity';
import { Between, EntityNotFoundError, Not, QueryFailedError, Repository } from 'typeorm';
import { Benefit } from '#/benefit/entities/benefit.entity';
import { Place } from '#/place/entities/place.entity';
import { PaginationDto } from '#/utils/pagination';
import { HolidayQueryDto, HolidaySort } from './dto/query.dto';
import { Image } from '#/image/entities/image.entity';
import { Itinerary } from '#/itinerary/entities/itinerary.entity';

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
    @InjectRepository(Benefit)
    private readonly benefitRepository: Repository<Benefit>,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(Itinerary)
    private readonly itineraryRepository: Repository<Itinerary>,
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
        title: createHolidayDto.title,
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

      const images = createHolidayDto.images.map((imageName) => 
        this.imageRepository.create({ 
          filename: imageName, 
          holidayId: holiday.id 
        })
      );
      await this.imageRepository.save(images);

      const itineraries = createHolidayDto.itineraries.map((itinerary) => 
        this.itineraryRepository.create({ 
          day: itinerary.day,
          description: itinerary.description,
          holidayId: holiday.id 
        })
      );
      await this.itineraryRepository.save(itineraries);

      return await this.holidayRepository.findOneOrFail({
        where: { id: holiday.id },
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

  async findAll(paginationDto: PaginationDto, queryDto: HolidayQueryDto) {
    try {
      const { page, limit } = paginationDto;
      const { sort } = queryDto;
      const offset = (page - 1) * limit;
      const whereClause = {};
      const sortClause = {};

      if (sort) {
        switch (sort) {
          case HolidaySort.AZ:
            sortClause['title'] = 'ASC';
            break;
          case HolidaySort.ZA:
            sortClause['title'] = 'DESC';
            break;
          case HolidaySort.LOWEST_PRICE:
            sortClause['price'] = 'ASC';
            break;
          case HolidaySort.HIGHEST_PRICE:
            sortClause['price'] = 'DESC';
            break;
          default:
            break;
        }
      }

      const [data, totalItems] = await this.holidayRepository.findAndCount({
        where: whereClause,
        order: sortClause,
        take: limit,
        skip: offset,
        relations: ['benefit', 'image'],
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
        throw new BadRequestException();
      }
      throw new InternalServerErrorException();
    }
  }

  async findOne(id: string) {
    try {
      const holiday = await this.holidayRepository.findOneOrFail({
        where: { id },
        relations: ['place', 'benefit', 'image', 'itinerary'],
      });

      const recommendations = await this.holidayRepository.find({
        where: {
          id: Not(id),
          price: Between(holiday.price * 0.5, holiday.price * 1.5),
        },
        relations: ['benefit', 'image'],
        order: {
          price: 'ASC',
          duration: 'ASC',
        },
        take: 3,
      });

      return {
        ...holiday,
        recommendations,
      }
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
        relations: ['place', 'benefit', 'image', 'itinerary'],
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
        title: updateHolidayDto.title,
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

      const existingImages = holiday.image.map(i => i.filename);
      
      const newImageNames = updateHolidayDto.images.filter(
        imageName => !existingImages.includes(imageName)
      );
      const newImages = newImageNames.map(
        imageName => this.imageRepository.create({ 
          filename: imageName, 
          holidayId: updatedHoliday.id 
        })
      );

      const imagesToRemove = holiday.image.filter(
        image => !updateHolidayDto.images.includes(image.filename)
      );
      
      if (imagesToRemove.length > 0) {
        await this.imageRepository.softRemove(imagesToRemove);
      }

      if (newImages.length > 0) {
        await this.imageRepository.save(newImages);
      }

      const existingItineraries = holiday.itinerary.map(i => i.day);
      
      const newItineraryDays = updateHolidayDto.itineraries.filter(
        itineraryDay => !existingItineraries.includes(itineraryDay.day)
      );
      const newItineraries = newItineraryDays.map(
        itineraryDay => this.itineraryRepository.create({ 
          day: itineraryDay.day, 
          description: itineraryDay.description, 
          holidayId: updatedHoliday.id 
        })
      );

      const itinerariesToRemove = holiday.itinerary.filter(
        itinerary =>
          !updateHolidayDto.itineraries.some(
            updateItinerary => updateItinerary.day === itinerary.day
          )
      );
      
      
      if (itinerariesToRemove.length > 0) {
        await this.itineraryRepository.softRemove(itinerariesToRemove);
      }

      if (newItineraries.length > 0) {
        await this.itineraryRepository.save(newItineraries);
      }

      return await this.holidayRepository.findOneOrFail({
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
