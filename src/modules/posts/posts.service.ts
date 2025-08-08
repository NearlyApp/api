import { BasePost } from '@nearlyapp/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '@users/users.service';
import { PostsRepository } from './posts.repository';

export const MAX_POSTS_PER_PAGE = 1000;
@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersService: UsersService,
  ) {}

  async getPostByUUID(uuid: string): Promise<BasePost> {
    const post = await this.postsRepository.findByUUID(uuid);
    if (!post) throw new NotFoundException(`Post with UUID ${uuid} not found`);
    return post;
  }
}
