import { BaseRepository, FindOptions } from '@drizzle/base.repository';
import { DrizzleService } from '@drizzle/drizzle.service';
import { likesSchema } from '@nearlyapp/common/schemas';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LikesRepository extends BaseRepository<typeof likesSchema> {
  constructor(protected readonly drizzleService: DrizzleService) {
    super(drizzleService, likesSchema);
  }

  async findByUUID(uuid: string, options?: FindOptions) {
    return this.findOne({ uuid }, options);
  }

  async findByAuthorUUID(authorUuid: string, options?: FindOptions) {
    return this.findMany({ authorUuid }, options);
  }

  async findByPostUUID(postUuid: string, options?: FindOptions) {
    return this.findMany({ parentPostUuid: postUuid }, options);
  }
}
