import { Controller, Get, Post, Body, Param, Delete, Put, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

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

  @Get()
  async findAll() {
    return {
      data: await this.holidayService.findAll(),
      statusCode: HttpStatus.OK,
      message: 'success',
    }
  }

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