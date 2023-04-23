import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { userNameRegex } from "_app/utils";

export class UserNameEmailCheckDto {
  @IsString()
  @Matches(userNameRegex, { message: "Invalid username" })
  @MinLength(3)
  @MaxLength(32)
  public username: string;

  @IsEmail()
  public email: string;
}

export class AccessCodeCheckDto {
  @IsString()
  @MinLength(10)
  @MaxLength(10)
  public accesscode: string;
}


