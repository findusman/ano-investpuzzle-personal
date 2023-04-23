import { IsEmail, IsOptional, IsString } from "class-validator";

export class LogInDto {
  @IsString()
  public emailOrUsername: string;

  @IsString()
  public password: string;

  @IsString()
  public loginType: string;

  @IsOptional()
  @IsString()
  public socialId: string;
}
