import { IsEnum, IsOptional, IsString } from "class-validator";
import { STOCK_SEARCH_ORDER } from "_app/enums/stock.enum";

export class StockSearchTypeDto {
  @IsEnum(STOCK_SEARCH_ORDER, { message: "Invalid order type" })
  @IsOptional()
  public orderBy: STOCK_SEARCH_ORDER;
}