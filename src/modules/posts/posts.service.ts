import { PaginatedResult } from '@/types/pagination';
import { BasePost, Post } from '@nearlyapp/common';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '@users/users.service';
import { CreatePostDto, GetPostsQueryDto, UpdatePostDto } from './posts.dto';
import { PostsRepository } from './posts.repository';

export const MAX_POSTS_PER_PAGE = 1000;
@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersService: UsersService,
  ) {}

  async getPostByUUID(uuid: string): Promise<Post> {
    const post = await this.postsRepository.findByUUID(uuid);
    if (!post) throw new NotFoundException(`Post with UUID ${uuid} not found`);
    return this.formatPost(post);
  }

  async getPostsByAuthor(
    query: GetPostsQueryDto,
    uuid: string,
  ): Promise<PaginatedResult<Post, 'posts'>> {
    const user = await this.usersService.getUserByUUID(uuid);
    if (!user) throw new NotFoundException(`User ${uuid} not found`);

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
      posts: posts.map((post) => this.formatPost(post)),
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
  ): Promise<PaginatedResult<Post, 'posts'>> {
    const { limit, offset } = this.postsRepository.getPaginationParams(
      query,
      MAX_POSTS_PER_PAGE,
    );

    const [posts, count] = await Promise.all([
      this.postsRepository.findMany(null, { limit, offset }),
      this.postsRepository.count(),
    ]);

    return {
      posts: posts.map((post) => this.formatPost(post)),
      pagination: {
        page: query.page ?? 1,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async createPost(userUuid: string, data: CreatePostDto): Promise<Post> {
    const author = await this.usersService.getUserByUUID(userUuid);
    if (!author) {
      throw new NotFoundException(`Author with UUID ${userUuid} not found`);
    }

    if (data.parentPostUuid) {
      try {
        await this.getPostByUUID(data.parentPostUuid);
      } catch {
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
      authorUuid: author.uuid,
    });

    return this.formatPost(post);
  }

  async updatePost(uuid: string, data: UpdatePostDto): Promise<Post> {
    const updatedPosts = await this.postsRepository.update({ uuid }, data);
    if (!updatedPosts || updatedPosts.length === 0)
      throw new NotFoundException(`Post with UUID ${uuid} not found`);
    return this.formatPost(updatedPosts[0]);
  }

  async deletePost(uuid: string): Promise<void> {
    try {
      await this.postsRepository.delete({ uuid });
    } catch {
      throw new Error(`Failed to delete post with UUID ${uuid}`);
    }
  }

  async deleteAll(authorUuid: string): Promise<void> {
    try {
      await this.postsRepository.deleteAll(authorUuid);
    } catch {
      throw new Error('Failed to delete all posts');
    }
  }

  async checkPostOwnership(
    userUuid: string,
    postUuid: string,
  ): Promise<boolean> {
    const post = await this.getPostByUUID(postUuid);
    return post.authorUuid === userUuid;
  }

  formatPost(post: BasePost): Post {
    return {
      uuid: post.uuid,
      authorUuid: post.authorUuid,
      parentPostUuid: post.parentPostUuid,
      content: post.content,
      coords: {
        lat: post.lat,
        lng: post.lng,
        alt: post.alt,
      },
      likes: 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      deletedAt: post.deletedAt,
    };
  }
}
