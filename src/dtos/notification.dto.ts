import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

export class ReadNotificationDto {
  @IsArray()
  @IsNotEmpty()
  public notiIds: string[];
}

export class TestNotiDto {
  @IsString()
  @IsNotEmpty()
  public token: string;
}
