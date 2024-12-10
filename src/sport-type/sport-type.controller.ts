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
import { CreateSportTypeDto } from './dto/create-sport-type.dto';
import { UpdateSportTypeDto } from './dto/update-sport-type.dto';
import { SportTypeService } from './sport-type.service';

@Controller('sport-types')
export class SportTypeController {
  constructor(private readonly sportTypeService: SportTypeService) {}

  @Post()
  async create(@Body() createSportTypeDto: CreateSportTypeDto) {
    return {
      data: await this.sportTypeService.create(createSportTypeDto),
      message: 'Success create sport type',
      statusCode: HttpStatus.CREATED,
    };
  }

  @Get()
  async findAll() {
    return {
      data: await this.sportTypeService.findAll(),
      message: 'Success get all sport type',
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return {
      data: await this.sportTypeService.findOne(id),
      message: 'Success get sport type',
      statusCode: HttpStatus.OK,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSportTypeDto: UpdateSportTypeDto,
  ) {
    return {
      data: await this.sportTypeService.update(id, updateSportTypeDto),
      message: 'Success update sport type',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.sportTypeService.remove(id);

    return {
      message: 'Success delete sport type',
      statusCode: HttpStatus.OK,
    };
  }
}
