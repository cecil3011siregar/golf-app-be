import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateItineraryDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  day: number;

  @IsNotEmpty()
  description: string;
}
