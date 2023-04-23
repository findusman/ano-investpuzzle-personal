import { Request } from "express";

export interface Group {
  _id: string;
  groupName: string;
  groupPhoto: string;
  isPublic: number;
  owner: string;
  groupDescription: string;
}

export interface GroupUser extends Request {
  _id: string;
  user: string;
  group: string;
  isRemoved: number;
  isInviteAccepted: number;
  isOwner: number;
  createdAt?: Date;
  updatedAt?: Date;
}
