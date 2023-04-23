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

export class CreatePostDto {
  @IsString()
  @IsOptional()
  public content: string; 

  @IsOptional()
  @IsUrl()
  @ValidateIf((e) => e.photoUrl !== "")
  @IsString()
  photoUrl?: string;
}

export class PostCommentDto {
  @IsString()
  @IsNotEmpty()
  public content: string; 
}

export class PostOrCommentLikeDto {
  @IsBoolean()
  @IsNotEmpty()
  public isLike: boolean; 
}

export class OwnerReplyDto {
  @IsString()
  @IsNotEmpty()
  public content: string; 
}
