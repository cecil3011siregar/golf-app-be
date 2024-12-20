import { Benefit } from '#/benefit/entities/benefit.entity';
import { GoogleDriveService } from '#/google-drive/google-drive.service';
import { Holiday } from '#/holiday/entities/holiday.entity';
import { Image } from '#/image/entities/image.entity';
import { SportType } from '#/sport-type/entities/sport-type.entity';
import { Sport } from '#/sport/entities/sport.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Sport)
    private readonly sportHolidayRepository: Repository<Sport>,
    @InjectRepository(SportType)
    private readonly sportTypeRepository: Repository<SportType>,
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(Benefit)
    private readonly benefitRepository: Repository<Benefit>,
    private readonly googleDriveService: GoogleDriveService,
  ) {}
  async getDashboard() {
    const totalSportHoliday = await this.sportHolidayRepository.count();
    const totalHoliday = await this.holidayRepository.count();

    const totalBothHoliday = totalHoliday + totalSportHoliday;

    const sportTypes = await this.sportTypeRepository.find({
      relations: ['sports'],
    });
    const benefits = await this.benefitRepository.find({
      relations: ['holiday'],
    });

    const totalSportHolidayBySportType = sportTypes.map((sportType) => ({
      name: sportType.name,
      value: sportType.sports.length,
    }));
    const totalHolidayByBenefit = benefits.map((benefit) => ({
      name: benefit.name,
      value: benefit.holiday.length,
    }));

    const expensiveSportHolidays = await this.sportHolidayRepository.find({
      take: 5,
      order: {
        price: 'DESC',
      },
    });
    const expensiveHolidays = await this.holidayRepository.find({
      take: 5,
      order: {
        price: 'DESC',
      },
    });

    const top5SportHoliday = await Promise.all(
      expensiveSportHolidays.map(async (sportHoliday) => {
        const firstImage = await this.imageRepository.findOne({
          where: { sport: { id: sportHoliday.id } },
          order: { createdAt: 'ASC' },
        });

        return {
          ...sportHoliday,
          image:
            (
              await this.googleDriveService.getFiles([firstImage?.filename])
            )[0] || null,
        };
      }),
    );

    const top5Holiday = await Promise.all(
      expensiveHolidays.map(async (holiday) => {
        const firstImage = await this.imageRepository.findOne({
          where: { holiday: { id: holiday.id } },
          order: { createdAt: 'ASC' },
        });

        return {
          ...holiday,
          image:
            (
              await this.googleDriveService.getFiles([firstImage?.filename])
            )[0] || null,
        };
      }),
    );

    const averageHolidayPrices = await this.getPriceRangeAnalytics();

    return {
      totalSportHoliday,
      totalHoliday,
      totalBothHoliday,
      totalSportHolidayBySportType,
      totalHolidayByBenefit,
      top5SportHoliday,
      top5Holiday,
      averageHolidayPrices,
    };
  }

  async getPriceRangeAnalytics(): Promise<{ range: string; value: number }[]> {
    const priceRanges = [
      { min: 100_000, max: 1_000_000 },
      { min: 1_000_000, max: 2_000_000 },
      { min: 2_000_000, max: 5_000_000 },
      { min: 5_000_000, max: 10_000_000 },
      { min: 10_000_000, max: null },
    ];

    const results = [];

    for (const range of priceRanges) {
      const holidaysCount = await this.sportHolidayRepository
        .createQueryBuilder('holiday')
        .where('holiday.price >= :min', { min: range.min })
        .andWhere(range.max ? 'holiday.price < :max' : '1=1', {
          max: range.max,
        })
        .getCount();

      const sportHolidaysCount = await this.holidayRepository
        .createQueryBuilder('sport')
        .where('sport.price >= :min', { min: range.min })
        .andWhere(range.max ? 'sport.price < :max' : '1=1', { max: range.max })
        .getCount();

      results.push({
        range: range.max
          ? `${range.min.toLocaleString()} - ${range.max.toLocaleString()}`
          : `${range.min.toLocaleString()}+`,
        holiday: holidaysCount,
        sportHoliday: sportHolidaysCount,
      });
    }

    return results;
  }
}
