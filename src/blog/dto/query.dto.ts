import { Status } from '#/sport/dto/query.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum BlogSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  AZ = 'az',
  ZA = 'za',
}

export class BlogQueryDto {
  @IsOptional()
  @IsEnum(BlogSort)
  sort?: BlogSort;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
