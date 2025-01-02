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
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogQueryDto } from './dto/query.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  async create(@Body() createBlogDto: CreateBlogDto) {
    return {
      data: await this.blogService.create(createBlogDto),
      statusCode: HttpStatus.CREATED,
      message: 'success',
    };
  }

  @Public()
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() queryDto: BlogQueryDto,
  ) {
    const data = await this.blogService.findAll(paginationDto, queryDto);
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
      data: await this.blogService.findOne(id),
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return {
      data: await this.blogService.update(id, updateBlogDto),
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }

  @Put(':id/status')
  async toogleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return {
      data: await this.blogService.toogleStatus(id),
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.blogService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }
}
