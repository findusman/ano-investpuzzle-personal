import * as http from "http";
import { User } from "./user.interface";

export interface SocketRequestWithUser extends http.IncomingMessage {
  user: User;
}
