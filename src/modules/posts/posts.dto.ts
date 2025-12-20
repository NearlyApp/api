import { RecommendationStatus } from '@/types/Recommendation';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
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

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  alt: Nullable<number>;
}

export class GetRecommendPostsQueryDto {
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

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Whether to include author in the response',
    example: true,
  })
  withAuthor: boolean = true;
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

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Whether to include author in the response',
    example: true,
  })
  withAuthor: boolean = true;
}

export class UpdatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, { message: 'Content cannot exceed 2000 characters' })
  @ApiProperty({
    description: 'Post content',
    example: 'This is my first post!',
    maxLength: 2000,
  })
  content: string;
}

export class UpdatePostStatusDto {
  @IsUUID()
  @ApiProperty({
    description: 'UUID of the post',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  post_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'New status of the post',
    example: 'PROCESSED',
  })
  status: RecommendationStatus;
}
