import type { PaginatedResult } from '@/types/pagination';
import { UsersRepository } from '@modules/users/users.repository';
import {
  MinimalUser,
  PrivateUser,
  PublicUser,
  UserEntity,
} from '@nearlyapp/common';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BANNED_USERNAMES } from '@users/users.constants';
import { GetUsersQueryDto } from '@users/users.dtos';
import bcrypt from 'bcrypt';

export const MAX_USERS_PER_PAGE = 1000;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async validateUser(
    login: string,
    password: string,
  ): Promise<Nullable<UserEntity>> {
    const user = (
      await Promise.all([
        this.usersRepository.findByUsername(login),
        this.usersRepository.findByEmail(login),
      ])
    ).filter(Boolean)[0];

    if (!user || !user.password || !bcrypt.compareSync(password, user.password))
      return null;

    return user;
  }

  async getUserByUUID(uuid: string): Promise<UserEntity> {
    const user = await this.usersRepository.findByUUID(uuid);
    if (!user) throw new NotFoundException(`User with UUID ${uuid} not found`);

    return user;
  }

  async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user)
      throw new NotFoundException(`User with email ${email} not found`);

    return user;
  }

  async getUserByUsername(username: string): Promise<UserEntity> {
    const user = await this.usersRepository.findByUsername(username);
    if (!user)
      throw new NotFoundException(`User with username ${username} not found`);

    return user;
  }

  async getUsers(
    query: GetUsersQueryDto,
  ): Promise<PaginatedResult<UserEntity, 'users'>> {
    const { limit, offset } = this.usersRepository.getPaginationParams(
      query,
      MAX_USERS_PER_PAGE,
    );

    const [users, count] = await Promise.all([
      this.usersRepository.findMany(null, {
        offset,
        limit,
      }),
      this.usersRepository.count(),
    ]);

    return {
      users,
      pagination: {
        page: query.page ?? 1,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async createUser(
    data: Omit<
      UserEntity,
      'uuid' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'searchRadiusMeters'
    >,
  ): Promise<UserEntity> {
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

    return user;
  }

  formatMinimalUser(user: UserEntity): MinimalUser {
    return {
      uuid: user.uuid,
      username: user.username,
      displayName: user.displayName || user.username,
      avatarUrl: user.avatarUrl,
    };
  }

  formatPublicUser(user: UserEntity): PublicUser {
    return {
      ...this.formatMinimalUser(user),
      biography: user.biography,
      bannerUrl: user.bannerUrl,
      profilePrivacyLevel: user.profilePrivacyLevel,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }

  formatPrivateUser(user: UserEntity): PrivateUser {
    return {
      ...this.formatPublicUser(user),
      email: user.email,
      searchRadiusMeters: user.searchRadiusMeters,
    };
  }
}
