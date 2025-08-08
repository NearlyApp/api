import { Controller } from '@nestjs/common';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: any) {}
}
