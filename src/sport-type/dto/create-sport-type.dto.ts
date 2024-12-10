import { IsNotEmpty } from 'class-validator';

export class CreateSportTypeDto {
  @IsNotEmpty()
  name: string;
}
