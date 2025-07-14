import { User } from '@nearlyapp/common';
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '@users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: (err: any, uuid?: string) => void): void {
    done(null, user.uuid);
  }

  async deserializeUser(
    uuid: string,
    done: (err: any, user: Nullable<User>) => void,
  ): Promise<void> {
    try {
      const user = await this.usersService.getUserByUUID(uuid);

      done(null, user || null);
    } catch (error) {
      done(error, null);
    }
  }
}
