import { IsString } from "class-validator";

export class ProfileFileDto {
  @IsString()
  public folder: string;

  @IsString()
  public type: string;

  @IsString()
  public name: string;
}
