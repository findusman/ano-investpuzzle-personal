import { Request } from "express";

export interface Stock {
  _id: string;
  symbol: string;
  name: string;
  price: number;
  beta : number,
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  currency : string,
  exchange: string;
  open: number;
  previousClose: number;
  eps: number;
  pe: string;
  earningsAnnouncement: string;
  sharesOutstanding: number;
  timestamp: number;
  country: string;
  ipoyear: string;
  sector: string;
  industry: string;
  mktCap: number;
  website: string;
  description: string;
  ceo: string;
  image: string;
  ipoDate: string;
  currencyRate : number;
}

export interface StockFollow extends Request {
  _id: string;
  user: string;
  stock: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StockPriceHistory {
  _id: string;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
  unadjustedVolume: number;
  change: number;
  changePercent: number;
  vwap: number;
  label: string;
  changeOverTime: number;
  stock: string;
}

export interface Return {
  _id: string;
  user: string;
  returns: number;
  percents: number;
  investing: number;
  createdAt: Date;
}

export interface Rank {
  _id: string;
  user: string;
}

export interface StockComment {
  _id: string;
  stock: string;
  user: string;
  content: string;
}

export interface StockCommentLike {
  _id: string;
  stockcomment: string;
  user: string;
  isLike: boolean;
}
