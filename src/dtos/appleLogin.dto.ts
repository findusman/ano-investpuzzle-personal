import { IsOptional, IsString } from "class-validator";

export class AppleLoginDto {
  @IsString()
  public token: string;
}
