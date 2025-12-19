import { PaginatedResult } from '@/types/pagination';
import { Recommendation, RecommendationStatus } from '@/types/Recommendation';
import { ConfigService } from '@config/config.service';
import { BasePost, Post } from '@nearlyapp/common';
import { SEARCH_RADIUS_METERS_DEFAULT } from '@nearlyapp/common/schemas/users';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LikesService } from '@posts/likes/likes.service';
import { RECOMMENDATION_RANDOM_POSTS_COUNT } from '@posts/posts.constants';
import { UsersService } from '@users/users.service';
import {
  CreatePostDto,
  GetPostsQueryDto,
  RecommendPostsQueryDto,
  UpdatePostDto,
} from './posts.dto';
import { PostsRepository } from './posts.repository';

export const MAX_POSTS_PER_PAGE = 1000;
@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly likesService: LikesService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
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
        { authorUuid: user.uuid, status: 'PROCESSED' },
        { limit, offset },
      ),
      this.postsRepository.count({
        authorUuid: user.uuid,
        status: 'PROCESSED',
      }),
    ]);

    return {
      posts: await Promise.all(posts.map((post) => this.formatPost(post))),
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
      this.postsRepository.findMany({ status: 'PROCESSED' }, { limit, offset }),
      this.postsRepository.count({ status: 'PROCESSED' }),
    ]);

    return {
      posts: await Promise.all(posts.map((post) => this.formatPost(post))),
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

    const ingestResult = await fetch(
      this.configService.get('RECOMMENDATION_API_URL')! + '/ingest',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.configService.get('RECOMMENDATION_API_KEY')!,
        },
        body: JSON.stringify({
          callback_url: this.configService.get<string>('CALLBACK_API_URL')!,
          data: {
            post_id: post.uuid,
            metadata: {
              location: {
                lat: post.lat,
                lon: post.lng,
              },
            },
            text: post.content,
          },
        }),
      },
    );
    if (!ingestResult.ok) {
      const errorBody: string = await ingestResult.text();
      console.error(
        `Failed to ingest post ${post.uuid} to recommendation API: ${ingestResult.status}\n${errorBody}`,
      );

      // Rollback post creation
      await this.postsRepository.delete({ uuid: post.uuid });
      throw new InternalServerErrorException('Failed to process post');
    }
    return this.formatPost(post);
  }

  async updatePost(uuid: string, data: UpdatePostDto): Promise<Post> {
    const updatedPosts = await this.postsRepository.update({ uuid }, data);
    if (!updatedPosts || updatedPosts.length === 0)
      throw new NotFoundException(`Post with UUID ${uuid} not found`);
    return this.formatPost(updatedPosts[0]);
  }

  async updateStatusPost(
    uuid: string,
    status: RecommendationStatus,
  ): Promise<Post> {
    const updatedPosts = await this.postsRepository.update(
      { uuid },
      {
        status,
      },
    );
    if (!updatedPosts || updatedPosts.length === 0)
      throw new NotFoundException(`Post with UUID ${uuid} not found`);
    return this.formatPost(updatedPosts[0]);
  }

  async deletePost(uuid: string): Promise<void> {
    try {
      await this.postsRepository.delete({ uuid });
      // Also delete from Recommendation API
      const deleteResult = await fetch(
        this.configService.get('RECOMMENDATION_API_URL')! + `/data/${uuid}`,
        {
          method: 'DELETE',
          headers: {
            'x-api-key': this.configService.get('RECOMMENDATION_API_KEY')!,
          },
        },
      );
      if (!deleteResult.ok) {
        console.error(
          `Failed to delete post ${uuid} from recommendation API: ${deleteResult.status}\n${await deleteResult.json()}`,
        );
      }
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

  // Seed for random posts
  async getRandomPosts(
    userUuid: Nullable<string>,
    count: number,
  ): Promise<Post[]> {
    const posts = await this.postsRepository.getRandomPosts(userUuid, count);
    return await Promise.all(posts.map((p) => this.formatPost(p, userUuid)));
  }

  async getRecommendedPosts(
    query: RecommendPostsQueryDto,
    userUuid: Nullable<string> = null,
    searchRadiusMeters: number = SEARCH_RADIUS_METERS_DEFAULT,
  ): Promise<Post[]> {
    const candidatePosts = await this.getRandomPosts(
      userUuid,
      RECOMMENDATION_RANDOM_POSTS_COUNT,
    );

    const recommendedPostsResult = await fetch(
      this.configService.get('RECOMMENDATION_API_URL')! + '/recommend',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.configService.get('RECOMMENDATION_API_KEY')!,
        },
        body: JSON.stringify({
          // user_uuid: userUuid,
          distance: this.convertSearchRadiusToDistance(searchRadiusMeters),
          location: {
            lat: query.lat,
            lon: query.lng,
          },
          candidates: candidatePosts.map((post) => ({
            post_id: post.uuid,
            metadata: {
              location: {
                lat: post.coords.lat,
                lon: post.coords.lng,
              },
            },
            text: post.content,
          })),
        }),
      },
    );

    if (!recommendedPostsResult.ok) {
      const errorBody: string = await recommendedPostsResult.text();
      console.error(
        `Failed to get recommendations: ${recommendedPostsResult.status}\n${errorBody}`,
      );
      throw new InternalServerErrorException('Failed to get recommendations');
    }

    const recommendedPostsIds: string[] = await recommendedPostsResult
      .json()
      .then((data: { recommendations: Recommendation[] }) =>
        data.recommendations.map((rec) => rec.post_id),
      );

    const posts = await Promise.all(
      recommendedPostsIds.map(async (postId: string) => {
        try {
          return await this.getPostByUUID(postId);
        } catch (err) {
          if (err instanceof NotFoundException) {
            return null;
          }
          throw err;
        }
      }),
    );

    return posts.filter(
      (post): post is Post => post !== null && post.authorUuid !== userUuid,
    );
  }

  private convertSearchRadiusToDistance(searchRadiusMeters: number): string {
    const km = Math.round(searchRadiusMeters / 1000);
    return `${km}km`;
  }

  async formatPost(post: BasePost, userUuid?: Nullable<string>): Promise<Post> {
    const likes = await this.likesService.populatePostLike(post.uuid, userUuid);

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
      likes,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      deletedAt: post.deletedAt,
    };
  }
}
