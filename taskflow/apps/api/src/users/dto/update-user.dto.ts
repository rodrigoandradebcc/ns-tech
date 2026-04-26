import { IsEmail, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString() @MinLength(2)
  name?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsUrl({ require_tld: false })
  avatarUrl?: string;

  @IsOptional() @IsString() @MaxLength(200)
  bio?: string;
}
