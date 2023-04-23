import { Request } from "express";

export interface Notification extends Request {
  _id: string;
  type: number; //0: follow request, 1: follow accepted, 2: group invite, 3: group invite accepted, 4: prume posted , 5: commented on forume, 6: bage earned
  content: string;
  isRead: number;
  sender: string;
  receiver: string;
  linkedId: string; // group id, user id , something else, comment id what ever
  isAccept: number;
}
