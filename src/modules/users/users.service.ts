import { UsersRepository } from '@modules/users/users.repository';
import { BaseUser, User } from '@modules/users/users.types';
import { Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { validate as isUUID } from 'uuid';

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

    const { password: _, ...userData } = user;

    return userData as User;
  }

  async getUser(identifier: string): Promise<User> {
    let user: Nullable<BaseUser> = null;
    if (isUUID(identifier))
      user = await this.usersRepository.findByUUID(identifier);
    else
      user = (
        await Promise.all([
          this.usersRepository.findByEmail(identifier),
          this.usersRepository.findByUsername(identifier),
        ])
      ).filter(Boolean)[0];

    if (!user)
      throw new NotFoundException(
        `User with identifier ${identifier} not found`,
      );

    const { password: _, ...userData } = user;

    return userData as User;
  }

  async getUserByUUID(uuid: string): Promise<User> {
    const user = await this.usersRepository.findByUUID(uuid);
    if (!user) throw new NotFoundException(`User with UUID ${uuid} not found`);

    const { password: _, ...userData } = user;

    return userData as User;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user)
      throw new NotFoundException(`User with email ${email} not found`);

    const { password: _, ...userData } = user;

    return userData as User;
  }

  async getUserByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findByUsername(username);
    if (!user)
      throw new NotFoundException(`User with username ${username} not found`);

    const { password: _, ...userData } = user;

    return userData as User;
  }

  async getUsers(): Promise<User[]> {
    const users = await this.usersRepository.findAll();

    return users.map((user) => {
      const { password: _, ...userData } = user;
      return userData as User;
    }) as User[];
  }
}
