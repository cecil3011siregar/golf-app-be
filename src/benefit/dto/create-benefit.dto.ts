import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBenefitDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  status: boolean;
}
