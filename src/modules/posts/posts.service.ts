import { PaginatedResult } from '@/types/pagination';
import { BasePost } from '@nearlyapp/common';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '@users/users.service';
import { CreatePostDto, GetPostsQueryDto } from './posts.dto';
import { PostsRepository } from './posts.repository';

export const MAX_POSTS_PER_PAGE = 1000;
@Injectable()
export class PostsService {
  // TODO: replace type BasePost by Post to get likes
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersService: UsersService,
  ) {}

  async getPostByUUID(uuid: string): Promise<BasePost> {
    const post = await this.postsRepository.findByUUID(uuid);
    if (!post) throw new NotFoundException(`Post with UUID ${uuid} not found`);
    return post;
  }

  async getPostsByAuthor(
    query: GetPostsQueryDto,
    identifier: string,
  ): Promise<PaginatedResult<BasePost, 'posts'>> {
    const user = await this.usersService.getUser(identifier);
    if (!user) throw new NotFoundException(`User ${identifier} not found`);

    const { limit, offset } = this.postsRepository.getPaginationParams(
      query,
      MAX_POSTS_PER_PAGE,
    );

    const [posts, count] = await Promise.all([
      this.postsRepository.findMany(
        { authorUuid: user.uuid },
        { limit, offset },
      ),
      this.postsRepository.count({ authorUuid: user.uuid }),
    ]);

    return {
      posts,
      pagination: {
        page: query.page ?? 1,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getPosts(
    query: GetPostsQueryDto,
  ): Promise<PaginatedResult<BasePost, 'posts'>> {
    const { limit, offset } = this.postsRepository.getPaginationParams(
      query,
      MAX_POSTS_PER_PAGE,
    );

    const [posts, count] = await Promise.all([
      this.postsRepository.findMany(null, { limit, offset }),
      this.postsRepository.count(),
    ]);

    return {
      posts,
      pagination: {
        page: query.page ?? 1,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async createPost(data: CreatePostDto): Promise<BasePost> {
    const author = await this.usersService.getUser(data.authorUuid);
    if (!author) {
      throw new NotFoundException(
        `Author with UUID ${data.authorUuid} not found`,
      );
    }

    if (data.parentPostUuid) {
      try {
        await this.getPostByUUID(data.parentPostUuid);
      } catch (error) {
        throw new BadRequestException(
          `Parent post with UUID ${data.parentPostUuid} not found`,
        );
      }
    }

    if (!data.content || data.content.trim().length === 0) {
      throw new BadRequestException('Post content cannot be empty');
    }

    if (Math.abs(data.lat) > 90 || Math.abs(data.lng) > 180) {
      throw new BadRequestException('Invalid coordinates provided');
    }

    const sanitizedContent = data.content.trim();

    const post = await this.postsRepository.create({
      ...data,
      content: sanitizedContent,
    });

    return post;
  }
}
