import { Request } from "express";
import { MESSAGE_TYPE } from "_app/enums";
import { User } from "./user.interface";

export interface ChatRoom extends Request {
  _id: string;
  creator: string;
  user: string;
  lastMessageSender : string;
  room : string;
  userData : User;  
  lastMessage : string,
  messageType : string,
}

export interface Chat {
  sender: string,
  room: string,
  message: string,
  messageType: MESSAGE_TYPE,
  createdAt: string,
  updatedAt: string,
}

// export interface ChatHistory {
//   user: User,
//   room: string,
//   lastMessage: string,
//   messageType: string,
//   createdAt: string,
//   updatedAt: string,
//   id : string
// }
