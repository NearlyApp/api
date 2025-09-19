import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class GetUsersQueryDto {
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
    description: 'Number of users per page',
    example: 50,
  })
  limit?: number;
}

export class CreateUserDto {
  @ApiProperty({
    minLength: 3,
    maxLength: 32,
  })
  @IsString()
  @Length(3, 32)
  @Matches(/^[a-zA-Z0-9._\-']+$/, {
    message: "Username can only contain letters, numbers, and ._-' characters",
  })
  username: string;

  @ApiProperty({})
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(320)
  email: string;

  @ApiProperty({
    minLength: 8,
  })
  @IsString()
  @Length(8, 128, { message: 'Password must be between 8 and 128 characters' })
  password: string;

  @ApiPropertyOptional({
    maxLength: 64,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  displayName: string | null = null;

  @ApiPropertyOptional({
    nullable: true,
  })
  @IsOptional()
  @IsString()
  biography: string | null = null;

  @ApiPropertyOptional({
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatarUrl: string | null = null;

  @ApiPropertyOptional({
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  resetPasswordToken: string | null = null;

  @ApiPropertyOptional({
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  resetPasswordTokenExpiresAt: Date | null = null;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    minLength: 3,
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @Length(3, 32)
  @Matches(/^[a-zA-Z0-9._\-']+$/, {
    message: "Username can only contain letters, numbers, and ._-' characters",
  })
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional({
    maxLength: 64,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  displayName?: string | null;

  @ApiPropertyOptional({
    nullable: true,
  })
  @IsOptional()
  @IsString()
  biography?: string | null;

  @ApiPropertyOptional({
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @Length(8, 128, { message: 'Password must be between 8 and 128 characters' })
  password?: string;

  @ApiPropertyOptional({
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatarUrl?: string | null;

  @ApiPropertyOptional({
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  resetPasswordToken?: string | null;

  @ApiPropertyOptional({
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  resetPasswordTokenExpiresAt?: Date | null;
}
