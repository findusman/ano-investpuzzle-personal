import { IsString, Matches, MaxLength, MinLength } from "class-validator";
import { userNameRegex } from "_app/utils";

export class UserNameCheckDto {
  @IsString()
  @Matches(userNameRegex, { message: "Invalid username" })
  @MinLength(3)
  @MaxLength(32)
  public username: string;
}
