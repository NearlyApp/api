import { BaseRepository, FindOptions } from '@drizzle/base.repository';
import { DrizzleService } from '@drizzle/drizzle.service';
import { usersSchema } from '@nearlyapp/common/schemas';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository extends BaseRepository<typeof usersSchema> {
  constructor(protected readonly drizzleService: DrizzleService) {
    super(drizzleService, usersSchema);
  }

  async findByUUID(uuid: string, options?: FindOptions) {
    return this.findOne({ uuid }, options);
  }

  async findByEmail(email: string, options?: FindOptions) {
    return this.findOne({ email }, options);
  }

  async findByUsername(username: string, options?: FindOptions) {
    return this.findOne({ username }, options);
  }
}
