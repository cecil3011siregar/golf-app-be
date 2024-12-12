import { Controller, Get, Post, Body, Param, Delete, Put, HttpStatus, ParseUUIDPipe, Query } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { PaginationDto } from '#/utils/pagination';
import { HolidayQueryDto } from './dto/query.dto';
import { Public } from '#/auth/decorators/public.decorators';

@Controller('holidays')
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Post()
  async create(@Body() createHolidayDto: CreateHolidayDto) {
    return {
      data: await this.holidayService.create(createHolidayDto),
      statusCode: HttpStatus.CREATED,
      message: 'success',
    }
  }

  @Public()
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() queryDto: HolidayQueryDto,
  ) {
    const data = await this.holidayService.findAll(paginationDto, queryDto);
    return {
      ...data,
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return {
      data: await this.holidayService.findOne(id),
      statusCode: HttpStatus.OK,
      message: 'success',
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateHolidayDto: UpdateHolidayDto
  ) {
    return {
      data: await this.holidayService.update(id, updateHolidayDto),
      statusCode: HttpStatus.OK,
      message: 'success',
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.holidayService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'success',
    }
  }
}