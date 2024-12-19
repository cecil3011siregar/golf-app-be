import { Public } from '#/auth/decorators/public.decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { BenefitService } from './benefit.service';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';

@Controller('benefits')
export class BenefitController {
  constructor(private readonly benefitService: BenefitService) {}

  @Post()
  async create(@Body() createBenefitDto: CreateBenefitDto) {
    return {
      data: await this.benefitService.create(createBenefitDto),
      statusCode: HttpStatus.CREATED,
      message: 'success',
    };
  }

  @Public()
  @Get()
  async findAll() {
    return {
      data: await this.benefitService.findAll(),
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBenefitDto: UpdateBenefitDto,
  ) {
    return {
      data: await this.benefitService.update(id, updateBenefitDto),
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.benefitService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }
}
