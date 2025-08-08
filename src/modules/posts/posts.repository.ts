import { BaseRepository, FindOptions } from '@drizzle/base.repository';
import { DrizzleService } from '@drizzle/drizzle.service';
import { postsSchema } from '@nearlyapp/common/schemas';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsRepository extends BaseRepository<typeof postsSchema> {
  constructor(protected readonly drizzleService: DrizzleService) {
    super(drizzleService, postsSchema);
  }

  async findByUUID(uuid: string, options?: FindOptions) {
    return this.findOne({ uuid }, options);
  }

  async findByLocation(lat: number, lng: number, options?: FindOptions) {
    // TODO: Implement location-based search logic
    return this.findMany({ lat, lng }, options);
  }

  async findByAuthorUUID(authorUuid: string, options?: FindOptions) {
    return this.findMany({ authorUuid }, options);
  }
}
