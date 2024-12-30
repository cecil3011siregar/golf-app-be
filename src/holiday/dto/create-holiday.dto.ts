import { CreateItineraryDto } from '#/itinerary/dto/create-itinerary.dto';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateHolidayDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  status: boolean;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  duration: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  places: string[];

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  benefits: string[];

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  images: string[];

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateItineraryDto)
  itineraries: CreateItineraryDto[];
}
