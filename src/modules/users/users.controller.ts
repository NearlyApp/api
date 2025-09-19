import ImageInterceptor from '@/interceptors/file.interceptor';
import { UsersService } from '@modules/users/users.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  CreateUserDto,
  GetUsersQueryDto,
  UpdateUserDto,
} from '@users/users.dtos';
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

  @Post()
  @UseInterceptors(ImageInterceptor())
  async createUser(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: CreateUserDto,
  ) {
    return this.usersService.createUser(body, file);
  }

  @Patch(':uuid')
  @UseInterceptors(ImageInterceptor())
  async updateUser(
    @Param('uuid') uuid: string,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: UpdateUserDto,
  ) {
    return this.usersService.updateUser(uuid, body, file);
  }
}
