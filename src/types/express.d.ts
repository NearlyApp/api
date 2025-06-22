import { User } from '@modules/users/users.types';

declare module 'express' {
  interface Request {
    user: Nullable<User>;
  }
}
