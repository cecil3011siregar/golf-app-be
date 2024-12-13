import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBenefitDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  image?: string;
}
