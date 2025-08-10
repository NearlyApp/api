import {
  Body,
  Controller,
  Delete,
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
import { UsersService } from '@users/users.service';
import { Request } from 'express';
import { CreatePostDto, GetPostsQueryDto, UpdatePostDto } from './posts.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async getPosts(@Query() query: GetPostsQueryDto) {
    return this.postsService.getPosts(query);
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
    const user = req.user
      ? this.usersService.getUserByUUID(req.user.uuid)
      : null;
    if (!user) throw new UnauthorizedException('You are not authenticated');

    return this.postsService.createPost(createPostDto);
  }

  @Patch(':uuid')
  @HttpCode(HttpStatus.OK)
  async updatePost(
    @Param('uuid') uuid: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(uuid, updatePostDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('uuid') uuid: string) {
    return this.postsService.deletePost(uuid);
  }
}
