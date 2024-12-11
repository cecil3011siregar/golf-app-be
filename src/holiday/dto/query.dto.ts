import { IsEnum, IsOptional } from 'class-validator';

export enum HolidaySort {
  LOWEST_PRICE = 'lowest_price',
  HIGHEST_PRICE = 'highest_price',
  AZ = 'az',
  ZA = 'za',
}

export class HolidayQueryDto {
  @IsOptional()
  @IsEnum(HolidaySort)
  sort: HolidaySort;
}
