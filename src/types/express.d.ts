import { User } from '@nearlyapp/common';

declare module 'express' {
  interface Request {
    user: Nullable<User>;
  }
}
