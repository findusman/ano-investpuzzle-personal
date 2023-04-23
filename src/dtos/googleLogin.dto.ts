import { IsString } from "class-validator";

export class GoogleLoginDto {
  @IsString()
  public token: string;
}
