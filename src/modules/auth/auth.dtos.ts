import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

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
