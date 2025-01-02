import { GoogleDriveService } from '#/google-drive/google-drive.service';
import { Image } from '#/image/entities/image.entity';
import { Status } from '#/sport/dto/query.dto';
import { PaginationDto } from '#/utils/pagination';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import {
  EntityNotFoundError,
  ILike,
  Not,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogQueryDto, BlogSort } from './dto/query.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  async create(createBlogDto: CreateBlogDto) {
    try {
      const blog = this.blogRepository.create({
        title: createBlogDto.title,
        content: createBlogDto.content,
        status: createBlogDto?.status,
      });
      await this.blogRepository.save(blog);

      if (createBlogDto.image) {
        const image = this.imageRepository.create({
          filename: createBlogDto.image,
          blog: blog,
        });
        await this.imageRepository.save(image);
      }

      await this.cacheManager.reset();

      return await this.blogRepository.findOneOrFail({
        where: {
          id: blog.id,
        },
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException();
      }
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException();
      }
      throw new InternalServerErrorException();
    }
  }

  async findAll(paginationDto: PaginationDto, queryDto: BlogQueryDto) {
    try {
      const cacheKey = `blogs:${JSON.stringify(queryDto)}:${JSON.stringify(
        paginationDto,
      )}`;

      const cachedData = await this.cacheManager.get(cacheKey);

      if (cachedData) {
        return cachedData as any;
      }

      const result = await this.getBlogFromDB(paginationDto, queryDto);

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getBlogFromDB(paginationDto: PaginationDto, queryDto: BlogQueryDto) {
    try {
      const { page, limit } = paginationDto;
      const { search, sort, status } = queryDto;
      const offset = (page - 1) * limit;

      const searchClause = search ? { title: ILike(`%${search}%`) } : {};

      const sortClause = {} as Record<string, string>;
      if (sort) {
        switch (sort) {
          case BlogSort.AZ:
            sortClause['title'] = 'ASC';
            break;
          case BlogSort.ZA:
            sortClause['title'] = 'DESC';
            break;
          case BlogSort.NEWEST:
            sortClause['createdAt'] = 'ASC';
            break;
          case BlogSort.OLDEST:
            sortClause['createdAt'] = 'DESC';
            break;
          default:
            break;
        }
      }

      const statusClause = status ? { status: status === Status.ACTIVE } : {};

      const [data, totalItems] = await this.blogRepository.findAndCount({
        where: { ...searchClause, ...statusClause },
        order: sortClause,
        take: limit,
        skip: offset,
        relations: ['image'],
      });

      const result = await Promise.all(
        data.map(async ({ image, ...blog }) => {
          const firstImage = await this.imageRepository.findOne({
            where: { blog: { id: blog.id } },
            order: { createdAt: 'ASC' },
          });

          return {
            ...blog,
            image:
              (
                await this.googleDriveService.getFiles([firstImage?.filename])
              )[0] || null,
          };
        }),
      );

      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: result,
        page,
        limit,
        totalPages,
        totalItems,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException();
      }
      throw new InternalServerErrorException();
    }
  }

  async findOne(id: string) {
    try {
      const blog = await this.blogRepository.findOneOrFail({
        where: { id },
        relations: ['image'],
      });

      const other = await this.blogRepository.find({
        where: {
          id: Not(id),
        },
        relations: ['image'],
        order: {
          createdAt: 'ASC',
        },
        take: 3,
      });

      const recommendations = await Promise.all(
        other.map(async (blog) => {
          const blogImage = await this.imageRepository.findOne({
            where: { blog: { id: blog.id } },
            order: { createdAt: 'ASC' },
          });

          return {
            ...blog,
            image:
              (
                await this.googleDriveService.getFiles([blogImage?.filename])
              )[0] || null,
          };
        }),
      );

      return {
        ...blog,
        image:
          (await this.googleDriveService.getFiles([blog.image?.filename]))[0] ||
          null,
        recommendations,
      };
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException();
      }
      throw new InternalServerErrorException();
    }
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    try {
      const blog = await this.blogRepository.findOneOrFail({
        where: { id },
      });

      const updatedBlog = this.blogRepository.create({
        ...blog,
        title: updateBlogDto.title,
        content: updateBlogDto.content,
        status: updateBlogDto?.status,
      });
      await this.blogRepository.save(updatedBlog);

      if (updateBlogDto.image) {
        const image = await this.imageRepository.findOne({
          where: { blog: { id } },
        });

        if (image) {
          image.filename = updateBlogDto.image;
          await this.imageRepository.update(image.id, image);
        } else {
          const newImage = new Image();
          newImage.filename = updateBlogDto.image;
          newImage.blog = blog;
          await this.imageRepository.insert(newImage);
        }
      }

      await this.cacheManager.reset();

      return await this.blogRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException();
      }
      if (error instanceof QueryFailedError) {
        throw new BadRequestException();
      }
      throw new InternalServerErrorException();
    }
  }

  async toogleStatus(id: string) {
    try {
      const blog = await this.blogRepository.findOneOrFail({
        where: { id },
      });

      blog.status = !blog.status;
      await this.blogRepository.save(blog);

      await this.cacheManager.reset();

      return await this.blogRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException();
      }
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string) {
    try {
      await this.blogRepository.findOneOrFail({
        where: { id },
      });

      await this.cacheManager.reset();

      await this.blogRepository.softDelete(id);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException();
      }
      throw new InternalServerErrorException();
    }
  }
}
