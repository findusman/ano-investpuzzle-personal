import { IsEmail, IsString } from "class-validator";

export class EmailCheckDto {
  @IsEmail()
  public email: string;
}
