import {
  AUTH_COOKIE_NAME,
  REMEMBER_ME_SESSION_TIMEOUT_MS,
  SESSION_TIMEOUT_MS,
} from '@auth/auth.constants';
import { SignUpBodyDto } from '@auth/auth.dtos';
import { Injectable } from '@nestjs/common';
import { UsersService } from '@users/users.service';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  signIn(req: Request, res: Response, rememberMe?: boolean) {
    return req.login(req.user!, (error) => {
      if (error) throw error;

      if (rememberMe) {
        req.session.cookie.maxAge = REMEMBER_ME_SESSION_TIMEOUT_MS;
        req.session.cookie.expires = new Date(
          Date.now() + REMEMBER_ME_SESSION_TIMEOUT_MS,
        );
      } else {
        req.session.cookie.maxAge = SESSION_TIMEOUT_MS;
        req.session.cookie.expires = new Date(Date.now() + SESSION_TIMEOUT_MS);
      }

      return res.send(req.user);
    });
  }

  async signUp(data: SignUpBodyDto, req: Request, res: Response) {
    const user = await this.usersService.createUser({
      username: data.username,
      displayName: null,
      email: data.email,
      biography: null,
      password: data.password,
      avatarUrl: null,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
    });

    return req.login(user, (error) => {
      if (error) throw error;

      return res.send(user);
    });
  }

  signOut(req: Request, res: Response) {
    return req.logout((error) => {
      if (error) throw error;

      req.session.destroy((error) => {
        if (error) throw error;

        res.clearCookie(AUTH_COOKIE_NAME);
        return res.send();
      });
    });
  }
}
