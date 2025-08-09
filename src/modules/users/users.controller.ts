import { UsersService } from '@modules/users/users.service';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { GetUsersQueryDto } from '@users/users.dtos';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  getMe(@Req() req: Request) {
    const user = req.user
      ? this.usersService.getUserByUUID(req.user.uuid)
      : null;

    if (!user) throw new UnauthorizedException('You are not authenticated');

    return user;
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  async getUser(@Param('uuid') uuid: string) {
    return this.usersService.getUserByUUID(uuid);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(@Query() query: GetUsersQueryDto) {
    return this.usersService.getUsers(query);
  }
}
