import { bool } from "aws-sdk/clients/signer";
import { Request } from "express";

export interface Badge {
  _id: string;
  title: string;
  content: string;
  number : number;
  type : number;
  activeUrl : string,
  inactiveUrl : string,
  isReceived : boolean;
  receivedAt : Date;
}

export interface UserBadge{
  _id: string;
  badge: string;
  user: string;
  createdAt?: Date;
  updatedAt?: Date;
}