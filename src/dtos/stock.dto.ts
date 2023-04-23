import { IsEmail, IsNotEmpty, IsString, MinLength, IsInt, IsOptional, IsNumber, IsBoolean, IsArray } from "class-validator";
export class FollowstockDto {
    @IsBoolean()
    public follow: boolean;
}



export class FollowMultiStockDto {
    @IsNotEmpty()
    @IsString()
    public stockIds: string;
}

export class StockCommentDto {
    @IsNotEmpty()
    @IsString()
    public content: string;
}

export class StockCommentLikeDto {
    @IsNotEmpty()
    @IsBoolean()
    public isLike: boolean;
}