import { IsNumber, IsString } from "class-validator";

export class TradeDto {
  @IsString()
  public stock: string;

  @IsNumber()
  public amount: number;

  @IsNumber()
  public quantity: number;

  @IsNumber()
  public isBuy: number;

  @IsString()
  public currency: string;

  @IsNumber()
  public usdAmount: number;

  @IsNumber()
  public currencyRate: number;
}
