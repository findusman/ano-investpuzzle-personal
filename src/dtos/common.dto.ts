import { IsEmail, IsNotEmpty, IsString, MinLength, IsInt, IsOptional, IsNumber } from "class-validator";
export class FilterStocklistDto {
    @IsInt()
    @IsNotEmpty()
    public filterType: number;
  
    @IsString()
    @MinLength(2)
    @IsNotEmpty()
    public keyword: string;

    @IsInt()
    @IsNotEmpty()
    public page: number;

    @IsInt()
    @IsNotEmpty()
    public limit: number;
  }