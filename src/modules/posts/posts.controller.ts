import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import {
  CreatePostDto,
  GetPostsQueryDto,
  GetRecommendPostsQueryDto,
  UpdatePostDto,
  UpdatePostStatusDto,
} from './posts.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getPosts(@Query() query: GetPostsQueryDto) {
    const result = await this.postsService.getPosts(query);
    return {
      posts: result.posts.map((post) => this.postsService.formatPost(post)),
      pagination: result.pagination,
    };
  }

  @Post('/callback/')
  @HttpCode(HttpStatus.OK)
  async updatePostStatus(@Body() updatePostDto: UpdatePostStatusDto) {
    const post = await this.postsService.updateStatusPost(
      updatePostDto.post_id,
      updatePostDto.status,
    );
    return this.postsService.formatPost(post);
  }

  @Get('/recommend')
  @HttpCode(HttpStatus.OK)
  async recommendPosts(
    @Query() query: GetRecommendPostsQueryDto,
    @Req() req: Request,
  ) {
    const posts = await this.postsService.getRecommendedPosts(
      query,
      req.user?.uuid,
      req.user?.searchRadiusMeters,
    );

    return {
      posts: posts.map((post) => this.postsService.formatPost(post)),
    };
  }

  @Get(':uuid')
  async getPost(@Param('uuid') uuid: string) {
    const post = await this.postsService.getPostByUUID(uuid);
    return this.postsService.formatPost(post);
  }

  @Get('author/:uuid')
  async getPostsByAuthor(
    @Query() query: GetPostsQueryDto,
    @Param('uuid') uuid: string,
  ) {
    const result = await this.postsService.getPostsByAuthor(query, uuid);
    return {
      posts: result.posts.map((post) => this.postsService.formatPost(post)),
      pagination: result.pagination,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Req() req: Request, @Body() createPostDto: CreatePostDto) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('You are not authenticated');

    const post = await this.postsService.createPost(user.uuid, createPostDto);
    return this.postsService.formatPost(post);
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

    const post = await this.postsService.updatePost(uuid, updatePostDto);
    return this.postsService.formatPost(post);
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
}
