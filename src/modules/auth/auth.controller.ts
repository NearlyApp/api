import { AUTH_COOKIE_NAME } from '@auth/auth.constants';
import {
  SignInBodyDto as SignInDto,
  SignUpBodyDto as SignUpDto,
} from '@auth/auth.dtos';
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '@users/users.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  signIn(@Body() body: SignInDto, @Req() req: Request, @Res() res: Response) {
    req.login(req.user!, (error) => {
      if (error) throw error;

      if (body.rememberMe) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;

      return res.send(req.user);
    });
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() body: SignUpDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = await this.usersService.createUser({
      username: body.username,
      displayName: null,
      email: body.email,
      biography: null,
      password: body.password,
      avatarUrl: null,
    });

    req.login(user, (error) => {
      if (error) throw error;

      return res.send(user);
    });
  }

  @Delete('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  signOut(@Req() req: Request, @Res() res: Response) {
    req.logout((error) => {
      if (error) throw error;

      req.session.destroy((error) => {
        if (error) throw error;

        res.clearCookie(AUTH_COOKIE_NAME);
        return res.send();
      });
    });
  }
}
