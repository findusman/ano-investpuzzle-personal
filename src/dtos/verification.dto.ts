import { IsEmail, IsNotEmpty, IsString, MinLength, IsInt } from "class-validator";

export class EmailVerifyTokenDto {  
  @IsString()
  @MinLength(5)
  @IsNotEmpty()
  public code: string;

  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  public type: number; //0: login, 1: signup, 2: forgot,
}

export class ResetPasswordTokenDto extends EmailVerifyTokenDto {
  @IsEmail()
  public email: string;

  @IsString()
  @MinLength(5)
  @IsNotEmpty()
  public password: string;
}

export class ConfirmCurrentPasswordDto {  
  @IsString() 
  @IsNotEmpty()
  public currentPassword: string;
}

export class SaveFcmTokenDto {  
  @IsString() 
  @IsNotEmpty()
  public token: string;
}
