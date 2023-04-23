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
import { userNameRegex } from "_app/utils";

export class CreateUserDto {
  @IsString()
  @MinLength(5)
  @IsNotEmpty()
  public password: string;

  @IsString()
  public pronounsId: string;

  @IsOptional()
  @IsString()
  public yearofBirth: string;

  @IsString()
  public countryId: string;

  @IsString()
  public educationId: string;

  @IsOptional()
  @IsString()
  public otherEducation: string;

  @IsOptional()
  @IsString()
  public otherPronouns: string;

  @IsOptional()
  @IsString()
  public loginType: string;

  @IsOptional()
  @IsString()
  public socialId: string;

  @IsOptional()
  @IsString()
  public bio: string;

  @IsString()
  public professor: string;
}


export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  public username: string;

  @IsOptional()
  @IsEmail({}, { message: "Invalid email address" })
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @IsNotEmpty()
  public password: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @IsNotEmpty()
  public currentpassword: string;

  @IsOptional()
  @IsString()
  public bio: string;

  @IsOptional()
  // @IsUrl()
  // @ValidateIf((e) => e.photoUrl !== "")
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsUrl()
  @ValidateIf((e) => e.coverImage !== "")
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  public pronoun: string;

  @IsOptional()
  @IsString()
  public yearofBirth: string;

  @IsOptional()
  @IsString()
  public country: string;

  @IsOptional()
  @IsString()
  public education: string;

  @IsOptional()
  @IsString()
  public userFullName: string;

  @IsOptional()
  @IsString()
  public otherEducation: string;

  @IsOptional()
  @IsString()
  public otherPronouns: string;
}

export class UserFollowDto {
  @IsBoolean()
  public follow: boolean;
}

export class CreateProfessorDto {
  @IsString()
  public userFullName: string;

  @IsString()
  public email: string;

  @IsString()
  public username: string;

  @IsString()
  @MinLength(5)
  @IsNotEmpty()
  public password: string;

  @IsString()
  public userPhone: string;

  @IsString()
  public universityName: string;

  @IsString()
  public title: string;

  @IsString()
  public fundName: string;

  @IsString()
  public fundsAum: number;
}

export class GetStudentsDto {
  @IsNumber()
  public studentStatus: number; //0: all, 1: not approved, 2: approved
}
