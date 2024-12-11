import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, Min } from 'class-validator';

export class CreateSportDto {
  @IsNotEmpty()
  @IsUUID()
  sportTypeId: string;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  location: string;

  @IsNotEmpty()
  duration: string;
}
