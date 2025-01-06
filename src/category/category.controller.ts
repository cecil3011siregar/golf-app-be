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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return {
      data: await this.categoryService.create(createCategoryDto),
      statusCode: HttpStatus.CREATED,
      message: 'success',
    };
  }

  @Public()
  @Get()
  async findAll() {
    return {
      data: await this.categoryService.findAll(),
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return {
      data: await this.categoryService.update(id, updateCategoryDto),
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }

  @Put(':id/status')
  async toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return {
      data: await this.categoryService.toogleStatus(id),
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.categoryService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }
}
