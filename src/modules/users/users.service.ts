import type { PaginatedResult } from '@/types/pagination';
import { UsersRepository } from '@modules/users/users.repository';
import { BaseUser, User } from '@nearlyapp/common';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BANNED_USERNAMES } from '@users/users.contants';
import { GetUsersQueryDto } from '@users/users.dtos';
import bcrypt from 'bcrypt';

export const MAX_USERS_PER_PAGE = 1000;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async validateUser(login: string, password: string): Promise<Nullable<User>> {
    const user = (
      await Promise.all([
        this.usersRepository.findByUsername(login),
        this.usersRepository.findByEmail(login),
      ])
    ).filter(Boolean)[0];

    if (!user || !user.password || !bcrypt.compareSync(password, user.password))
      return null;

    return this.formatUser(user);
  }

  async getUserByUUID(uuid: string): Promise<User> {
    const user = await this.usersRepository.findByUUID(uuid);
    if (!user) throw new NotFoundException(`User with UUID ${uuid} not found`);

    return this.formatUser(user);
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user)
      throw new NotFoundException(`User with email ${email} not found`);

    return this.formatUser(user);
  }

  async getUserByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findByUsername(username);
    if (!user)
      throw new NotFoundException(`User with username ${username} not found`);

    return this.formatUser(user);
  }

  async getUsers(
    query: GetUsersQueryDto,
  ): Promise<PaginatedResult<User, 'users'>> {
    const limit = Math.min(
      query.limit ?? MAX_USERS_PER_PAGE,
      MAX_USERS_PER_PAGE,
    );
    const offset = query.page ? (query.page - 1) * limit : 0;

    const [users, count] = await Promise.all([
      this.usersRepository.findMany(null, {
        offset,
        limit,
      }),
      this.usersRepository.count(),
    ]);

    return {
      users: users.map((user) => this.formatUser(user)),
      pagination: {
        page: query.page ?? 1,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async createUser(
    data: Omit<BaseUser, 'uuid' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<User> {
    if (BANNED_USERNAMES.includes(data.username))
      throw new BadRequestException({
        statusCode: 400,
        message: `Username "${data.username}" is not allowed`,
        error: 'Bad Request',
        errors: {
          username: [`This username is not allowed`],
        },
      });

    const existingUsers = await Promise.all([
      this.usersRepository.findByEmail(data.email),
      this.usersRepository.findByUsername(data.username),
    ]);

    if (existingUsers[0])
      throw new ConflictException({
        statusCode: 409,
        message: `Email ${data.email} is already in use`,
        error: 'Conflict',
        errors: {
          email: [`This email is already registered`],
        },
      });
    if (existingUsers[1])
      throw new ConflictException({
        statusCode: 409,
        message: `Username ${data.username} is already in use`,
        error: 'Conflict',
        errors: {
          username: [`This username is already taken`],
        },
      });

    const hashedPassword = bcrypt.hashSync(data.password, 10);

    const user = await this.usersRepository.create({
      ...data,
      password: hashedPassword,
    });

    return this.formatUser(user);
  }

  formatUser(user: BaseUser): User {
    return {
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      displayName: user.displayName || user.username,
      avatarUrl: user.avatarUrl,
      biography: user.biography,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }
}
