import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
} from '@drizzle/schemas/users.schema';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignInBodyDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ name: 'login', type: String, required: true })
  login: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ name: 'password', type: String, required: true })
  password: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ name: 'rememberMe', type: Boolean, required: false })
  rememberMe?: boolean;
}

export class SignUpBodyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(USERNAME_MIN_LENGTH, {
    message: `username should be at least ${USERNAME_MIN_LENGTH} characters`,
  })
  @MaxLength(USERNAME_MAX_LENGTH, {
    message: `username should be at most ${USERNAME_MAX_LENGTH} characters`,
  })
  @Matches(USERNAME_REGEX, {
    message:
      "username can only contain letters (a-z, A-Z), digits (0-9), and special characters (._-')",
  })
  @ApiProperty({ name: 'username', type: String, required: true })
  username: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ name: 'email', type: String, required: true })
  email: string;

  @IsString()
  @IsStrongPassword()
  @IsNotEmpty()
  @ApiProperty({ name: 'password', type: String, required: true })
  password: string;
}
