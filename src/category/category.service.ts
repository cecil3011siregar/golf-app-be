import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const newCategory = this.categoryRepository.create(createCategoryDto);
      await this.categoryRepository.save(newCategory);
      await this.cacheManager.reset();
      return await this.categoryRepository.findOneOrFail({
        where: { id: newCategory.id },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findAll() {
    try {
      const cacheKey = 'categoryAll';
      const cachedData = await this.cacheManager.get(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const categories = await this.categoryRepository.find({
        order: { updatedAt: 'DESC' },
        relations: ['blog'],
      });

      const formattedCategories = await Promise.all(
        categories.map(async ({ blog, ...category }) => ({
          ...category,
          totalBlogs: blog.length,
        })),
      );

      await this.cacheManager.set(cacheKey, formattedCategories);
      return formattedCategories;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findOne(id: string) {
    try {
      return await this.categoryRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.categoryRepository.findOneOrFail({
        where: { id },
      });

      const updatedCategory = this.categoryRepository.create({
        ...category,
        ...updateCategoryDto,
      });

      await this.categoryRepository.save(updatedCategory);
      await this.cacheManager.reset();
      return await this.categoryRepository.findOneOrFail({
        where: { id: updatedCategory.id },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async toogleStatus(id: string) {
    try {
      const category = await this.categoryRepository.findOneOrFail({
        where: { id },
      });

      category.status = !category.status;
      await this.categoryRepository.save(category);
      await this.cacheManager.reset();
      return await this.categoryRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string) {
    try {
      const category = await this.categoryRepository.findOneOrFail({
        where: { id },
      });

      await this.cacheManager.reset();

      await this.categoryRepository.softDelete(id);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
