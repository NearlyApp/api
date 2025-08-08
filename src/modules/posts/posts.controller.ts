import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@users/users.service';
import { Request } from 'express';
import { CreatePostDto, GetPostsQueryDto } from './posts.dto';
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

  @Get('author/:identifier')
  async getPostsByAuthor(
    @Query() query: GetPostsQueryDto,
    @Param('identifier') identifier: string,
  ) {
    return this.postsService.getPostsByAuthor(query, identifier);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Req() req: Request, @Body() createPostDto: CreatePostDto) {
    const user = req.user ? this.usersService.getUser(req.user.uuid) : null;
    if (!user) throw new UnauthorizedException('You are not authenticated');

    return this.postsService.createPost(createPostDto);
  }
}
