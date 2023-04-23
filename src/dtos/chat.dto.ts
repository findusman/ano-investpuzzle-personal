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

export class GetRoomDataDto {
  @IsString()
  @IsNotEmpty()
  public user: string;
}

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  public sender: string;

  @IsString()
  @IsNotEmpty()
  public room: string;

  @IsString()
  @IsNotEmpty()
  public message: string;

  @IsString()
  @IsNotEmpty()
  public messageType: string;

}
