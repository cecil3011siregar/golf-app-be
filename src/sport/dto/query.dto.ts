import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum SportSort {
  LOWEST_PRICE = 'lowest_price',
  HIGHEST_PRICE = 'highest_price',
  AZ = 'az',
  ZA = 'za',
}

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class SportQueryDto {
  @IsOptional()
  type: string;

  @IsOptional()
  @IsEnum(SportSort)
  sort: SportSort;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsEnum(Status)
  status: Status;
}
