import { CreateItineraryDto } from '#/itinerary/dto/create-itinerary.dto';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

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

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  images: string[];

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateItineraryDto)
  itineraries: CreateItineraryDto[];
}
