import { Status } from '#/sport/dto/query.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBenefitDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
