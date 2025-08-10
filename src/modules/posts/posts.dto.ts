import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, { message: 'Content cannot exceed 2000 characters' })
  @ApiProperty({
    description: 'Post content',
    example: 'This is my first post!',
    maxLength: 2000,
  })
  content: string;

  @IsUUID()
  @ApiProperty({
    description: 'UUID of the post author',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  authorUuid: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description: 'UUID of the parent post (for replies)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  parentPostUuid: string;

  @IsLatitude()
  @Type(() => Number)
  @ApiProperty({
    description: 'Latitude coordinate',
    example: 48.8566,
    minimum: -90,
    maximum: 90,
  })
  lat: number;

  @IsLongitude()
  @Type(() => Number)
  @ApiProperty({
    description: 'Longitude coordinate',
    example: 2.3522,
    minimum: -180,
    maximum: 180,
  })
  lng: number;
}

export class GetPostsQueryDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  page?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Number of posts per page',
    example: 50,
  })
  limit?: number;
}
