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

export class SignInDto {
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

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'username should be at least 3 characters' })
  @MaxLength(32, { message: 'username should be at most 32 characters' })
  @Matches(/^[a-zA-Z0-9._\-']+$/, {
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
