import { bool } from "aws-sdk/clients/signer";
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

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  public groupName: string;

  @IsString()
  @IsOptional()
  public groupPhoto: string;

  @IsNumber()
  public isPublic: number;

  @IsString()  
  @IsOptional()
  public groupDescription: string;

  @IsArray()
  public users: [];
}

export class UpdateGroupDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public groupName: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public groupPhoto: string;

  @IsNumber()
  @IsOptional()
  public isPublic: number;

  @IsString()
  @IsOptional()
  public groupDescription: string;

  @IsArray()
  @IsOptional()
  public users: [];
}

export class RemoveuserDto {
  @IsString()
  @IsNotEmpty()
  public user: string;
}

export class AcceptGroupInviteDto {
  @IsBoolean()
  @IsNotEmpty()
  public isAccept: boolean;
}

export class AcceptGroupJoinDto {
  @IsString()
  @IsNotEmpty()
  public user: string;

  @IsString()
  @IsNotEmpty()
  public notiId: string;

  @IsBoolean()
  @IsNotEmpty()
  public isAccept: boolean;
}
