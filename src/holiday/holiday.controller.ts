import { Public } from '#/auth/decorators/public.decorators';
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
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { HolidayQueryDto } from './dto/query.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { HolidayService } from './holiday.service';

@Controller('holidays')
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Post()
  async create(@Body() createHolidayDto: CreateHolidayDto) {
    return {
      data: await this.holidayService.create(createHolidayDto),
      statusCode: HttpStatus.CREATED,
      message: 'success',
    };
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
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHolidayDto: UpdateHolidayDto,
  ) {
    return {
      data: await this.holidayService.update(id, updateHolidayDto),
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }

  @Put(':id/status')
  async toogleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return {
      data: await this.holidayService.toogleStatus(id),
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.holidayService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }
}
