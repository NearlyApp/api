import { UserEntity } from '@nearlyapp/common';

declare module 'express' {
  interface Request {
    user: Nullable<UserEntity>;
  }
}
