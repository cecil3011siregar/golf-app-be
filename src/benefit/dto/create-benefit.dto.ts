import { IsNotEmpty, IsString } from "class-validator";

export class CreateBenefitDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
