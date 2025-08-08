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
    return this.findOne({ lat, lng }, options);
  }

  async findByAuthorUuid(authorUuid: string, options?: FindOptions) {
    return this.findOne({ authorUuid }, options);
  }
}
