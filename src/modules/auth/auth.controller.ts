import { SignInDto } from '@modules/auth/auth.dtos';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  signIn(@Body() body: SignInDto, @Req() req: Request, @Res() res: Response) {
    req.login(req.user!, (error) => {
      if (error) {
        throw new InternalServerErrorException('Failed to sign in');
      }

      if (body.rememberMe) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;

      return res.send(req.user);
    });
  }
}
