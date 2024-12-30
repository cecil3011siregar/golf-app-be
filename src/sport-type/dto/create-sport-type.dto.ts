import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSportTypeDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  image: string;

  @IsOptional()
  @IsBoolean()
  status: boolean;
}
