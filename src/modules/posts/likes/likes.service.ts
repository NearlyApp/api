import { PaginatedResult } from '@/types/pagination';
import { Like } from '@nearlyapp/common';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostsRepository } from '@posts/posts.repository';
import { UsersService } from '@users/users.service';
import { GetLikesQueryDto } from './likes.dto';
import { LikesRepository } from './likes.repository';

export const MAX_LIKES_PER_PAGE = 100;

@Injectable()
export class LikesService {
  constructor(
    private readonly likesRepository: LikesRepository,
    private readonly postsRepository: PostsRepository,
    private readonly usersService: UsersService,
  ) {}

  async getLikeByUUID(uuid: string): Promise<Like> {
    const like = await this.likesRepository.findByUUID(uuid);
    if (!like) throw new NotFoundException(`Like with UUID ${uuid} not found`);
    return like;
  }

  async getLikesByPostUUID(
    postUuid: string,
  ): Promise<{ likes: Like[]; count: number }> {
    const [likes, count] = await Promise.all([
      this.likesRepository.findMany({ parentPostUuid: postUuid }),
      this.likesRepository.count({ parentPostUuid: postUuid }),
    ]);

    return { likes, count };
  }

  async getLikesByUserUUID(
    query: GetLikesQueryDto,
    userUuid: string,
  ): Promise<PaginatedResult<Like, 'likes'>> {
    const user = await this.usersService.getUserByUUID(userUuid);
    if (!user) throw new NotFoundException(`User ${userUuid} not found`);

    const { limit, offset } = this.likesRepository.getPaginationParams(
      query,
      MAX_LIKES_PER_PAGE,
    );

    const [likes, count] = await Promise.all([
      this.likesRepository.findMany(
        { authorUuid: user.uuid },
        { limit, offset },
      ),
      this.likesRepository.count({ authorUuid: user.uuid }),
    ]);

    return {
      likes,
      pagination: {
        page: query.page ?? 1,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getLikeByPostAndUserUUID(
    postUuid: string,
    userUuid: string,
  ): Promise<Like> {
    const like = await this.likesRepository.findOne({
      parentPostUuid: postUuid,
      authorUuid: userUuid,
    });

    if (!like) throw new NotFoundException(`Like not found`);
    return like;
  }

  async createLike(postUuid: string, userUuid: string): Promise<Like> {
    const post = await this.postsRepository.findByUUID(postUuid);
    if (!post)
      throw new NotFoundException(`Post with UUID ${postUuid} not found`);

    const user = await this.usersService.getUserByUUID(userUuid);
    if (!user)
      throw new NotFoundException(`User with UUID ${userUuid} not found`);

    const existingLike = await this.likesRepository.findOne({
      parentPostUuid: postUuid,
      authorUuid: userUuid,
    });

    if (existingLike) throw new BadRequestException('Like already exists');

    return this.likesRepository.create({
      parentPostUuid: postUuid,
      authorUuid: userUuid,
    });
  }

  async deleteLike(postUuid: string, userUuid: string): Promise<void> {
    const like = await this.getLikeByPostAndUserUUID(postUuid, userUuid);
    if (!like) throw new NotFoundException(`Like not found`);

    const { uuid } = like;
    await this.likesRepository.delete({ uuid });
  }

  async getPostLikesCount(postUuid: string): Promise<number> {
    const post = await this.postsRepository.findByUUID(postUuid);
    if (!post)
      throw new NotFoundException(`Post with UUID ${postUuid} not found`);
    const { count } = await this.getLikesByPostUUID(postUuid);

    return count;
  }

  async getIfUserLikedPost(
    postUuid: string,
    userUuid: string,
  ): Promise<boolean> {
    const like = await this.getLikeByPostAndUserUUID(postUuid, userUuid);

    return !!like;
  }

  async populatePostLike(
    postUuid: string,
    userUuid?: Nullable<string>,
  ): Promise<{ count: number; isLikedByUser: boolean }> {
    const count = (await this.getPostLikesCount(postUuid)) ?? 0;
    const isLikedByUser = userUuid
      ? await this.getIfUserLikedPost(postUuid, userUuid)
      : false;

    return { count, isLikedByUser };
  }
}
