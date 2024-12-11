import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateHolidayDto {
  @IsNotEmpty()
  @IsString()
  title: string;

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
  @IsString({ each: true })
  places: string[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  benefits: string[];
}
