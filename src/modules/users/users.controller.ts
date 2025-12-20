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
  async getMe(@Req() req: Request) {
    const user = req.user
      ? await this.usersService.getUserByUUID(req.user.uuid)
      : null;

    if (!user) throw new UnauthorizedException('You are not authenticated');

    return this.usersService.formatPrivateUser(user);
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  async getUser(@Param('uuid') uuid: string) {
    const user = await this.usersService.getUserByUUID(uuid);
    return this.usersService.formatPublicUser(user);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(@Query() query: GetUsersQueryDto) {
    const result = await this.usersService.getUsers(query);

    return {
      users: result.users.map((user) =>
        this.usersService.formatPublicUser(user),
      ),
      pagination: result.pagination,
    };
  }
}
