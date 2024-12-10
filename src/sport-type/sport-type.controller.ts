import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SportTypeService } from './sport-type.service';
import { CreateSportTypeDto } from './dto/create-sport-type.dto';
import { UpdateSportTypeDto } from './dto/update-sport-type.dto';

@Controller('sport-type')
export class SportTypeController {
  constructor(private readonly sportTypeService: SportTypeService) {}

  @Post()
  create(@Body() createSportTypeDto: CreateSportTypeDto) {
    return this.sportTypeService.create(createSportTypeDto);
  }

  @Get()
  findAll() {
    return this.sportTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sportTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSportTypeDto: UpdateSportTypeDto) {
    return this.sportTypeService.update(+id, updateSportTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sportTypeService.remove(+id);
  }
}
