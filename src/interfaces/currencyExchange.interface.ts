export interface CurrencyExchange {
    _id: string;
    currency: string;
    bid: number;
    ask : number;
    open : number;
    low : number,
    high : number,
    change : number
  }