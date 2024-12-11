import { IsEnum, IsOptional } from 'class-validator';

export enum SportSort {
  LOWEST_PRICE = 'lowest_price',
  HIGHEST_PRICE = 'highest_price',
  AZ = 'az',
  ZA = 'za',
}

export class SportQueryDto {
  @IsOptional()
  type: string;

  @IsOptional()
  @IsEnum(SportSort)
  sort: SportSort;
}
