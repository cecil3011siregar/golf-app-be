import { PaginationDto } from '#/utils/pagination';
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
  Query,
} from '@nestjs/common';
import { CreateSportDto } from './dto/create-sport.dto';
import { SportQueryDto } from './dto/query.dto';
import { UpdateSportDto } from './dto/update-sport.dto';
import { SportService } from './sport.service';

@Controller('sport-holidays')
export class SportController {
  constructor(private readonly sportService: SportService) {}

  @Post()
  async create(@Body() createSportDto: CreateSportDto) {
    return {
      data: await this.sportService.create(createSportDto),
      statusCode: HttpStatus.CREATED,
      message: 'Success create sport holiday',
    };
  }

  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() queryDto: SportQueryDto,
  ) {
    const data = await this.sportService.findAll(paginationDto, queryDto);
    return {
      ...data,
      statusCode: HttpStatus.OK,
      message: 'Success get all sport holidays',
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return {
      data: await this.sportService.findOne(id),
      statusCode: HttpStatus.OK,
      message: 'Success get sport holiday',
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSportDto: UpdateSportDto,
  ) {
    return {
      data: await this.sportService.update(id, updateSportDto),
      statusCode: HttpStatus.OK,
      message: 'Success update sport holiday',
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.sportService.remove(id);

    return {
      message: 'Success delete sport holiday',
      statusCode: HttpStatus.OK,
    };
  }
}
