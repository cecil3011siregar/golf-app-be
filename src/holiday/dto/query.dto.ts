import { Status } from '#/sport/dto/query.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum HolidaySort {
  LOWEST_PRICE = 'lowest_price',
  HIGHEST_PRICE = 'highest_price',
  AZ = 'az',
  ZA = 'za',
}

export class HolidayQueryDto {
  @IsOptional()
  @IsEnum(HolidaySort)
  sort?: HolidaySort;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
