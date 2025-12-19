import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { LikesService } from './likes.service';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':postUuid')
  @HttpCode(HttpStatus.CREATED)
  async createLike(@Req() req: Request, @Param('postUuid') postUuid: string) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('You are not authenticated');

    return this.likesService.createLike(postUuid, user.uuid);
  }

  @Delete(':postUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLike(@Req() req: Request, @Param('postUuid') postUuid: string) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('You are not authenticated');

    return this.likesService.deleteLike(postUuid, user.uuid);
  }
}
