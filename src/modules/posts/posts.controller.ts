import { Recommendation } from '@/types/Recommendation';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@users/users.service';
import { Request } from 'express';
import {
  CreatePostDto,
  GetPostsQueryDto,
  UpdatePostDto,
  UpdatePostStatusDto,
} from './posts.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async getPosts(@Query() query: GetPostsQueryDto) {
    return this.postsService.getPosts(query);
  }

  @Post('/callback/')
  @HttpCode(HttpStatus.OK)
  async updatePostStatus(@Body() updatePostDto: UpdatePostStatusDto) {
    return this.postsService.updateStatusPost(
      updatePostDto.post_id,
      updatePostDto.status,
    );
  }

  @Get('/recommend')
  @HttpCode(HttpStatus.OK)
  async recommendPosts() {
    // Seed for recommendation
    const firstRandomPosts = await this.postsService.getRandomPosts(5);

    const recommendedPostsResult = await fetch(
      this.configService.get('RECOMMENDATION_API_URL')! + '/recommend',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.configService.get('RECOMMENDATION_API_KEY')!,
        },
        body: JSON.stringify({
          // mock location and distance for now
          distance: '100km',
          location: {
            lat: 90,
            lon: 45,
          },
          candidates: firstRandomPosts.map((post) => ({
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
      throw new UnauthorizedException('Failed to get recommendations');
    }

    const recommendedPostsIds: string[] = await recommendedPostsResult
      .json()
      .then((data: { recommendations: Recommendation[] }) =>
        data.recommendations.map((rec) => rec.post_id),
      );

    const posts = await Promise.all(
      recommendedPostsIds.map(async (postId: string) => {
        try {
          return await this.postsService.getPostByUUID(postId);
        } catch (err) {
          if (err instanceof NotFoundException) {
            return null;
          }
          throw err;
        }
      }),
    );

    return posts.filter((post) => post !== null);
  }

  @Get(':uuid')
  async getPost(@Param('uuid') uuid: string) {
    return this.postsService.getPostByUUID(uuid);
  }

  @Get('author/:uuid')
  async getPostsByAuthor(
    @Query() query: GetPostsQueryDto,
    @Param('uuid') uuid: string,
  ) {
    return this.postsService.getPostsByAuthor(query, uuid);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Req() req: Request, @Body() createPostDto: CreatePostDto) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('You are not authenticated');

    return this.postsService.createPost(user.uuid, createPostDto);
  }

  @Patch(':uuid')
  @HttpCode(HttpStatus.OK)
  async updatePost(
    @Req() req: Request,
    @Param('uuid') uuid: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('You are not authenticated');

    const isOwner = await this.postsService.checkPostOwnership(user.uuid, uuid);
    if (!isOwner) {
      throw new ForbiddenException('You can only update your own posts');
    }

    return this.postsService.updatePost(uuid, updatePostDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Req() req: Request, @Param('uuid') uuid: string) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('You are not authenticated');

    const isOwner = await this.postsService.checkPostOwnership(user.uuid, uuid);
    if (!isOwner) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    return this.postsService.deletePost(uuid);
  }

  // @Delete()
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteAllPost(@Req() req: Request) {
  //   const user = req.user
  //     ? this.usersService.getUserByUUID(req.user.uuid)
  //     : null;
  //   if (!user) throw new UnauthorizedException('You are not authenticated');

  //   const uuid = (await user).uuid;
  //   return this.postsService.deleteAll(uuid);
  // }
}
