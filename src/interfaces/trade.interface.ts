import { Request } from "express";

export interface Trade extends Request {
  _id: string;
  user: string;
  amount: number;
  stock: string;
  quantity: number;
  currency: string,
  usdAmount: number,
  currencyRate: number,
}

export interface Buy {
  user: string,
  stock: string,
  amount: number,
  quantity: number,
  currency: string,
  usdAmount: number,
  currencyRate: number,
  createdAt: string,
  updatedAt: string,
}
