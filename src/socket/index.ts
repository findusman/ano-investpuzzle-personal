import * as http from "http";
import { Server as SocketServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { mongo } from "mongoose";

import { socketAuthMiddleware } from "./middlewares";
import { SocketRequestWithUser } from "_app/interfaces";
import { User } from "../interfaces/user.interface";
import { MESSAGE_TYPE, NOTIFICATION_TYPE } from "_app/enums/socket.enum";
import { ChatService } from "_app/services";

let connection: SocketApp = null;
class SocketApp {
  public socketServer: SocketServer;
  public chatService = new ChatService();

  constructor() {}

  connect(server: http.Server) {
    console.log("socket connect");
    this.socketServer = new SocketServer(server, {
      cors: {
        origin: ["http://localhost:3000", "https://wafflestock.com"],
        credentials: true,
      },
    });

    this.socketServer.use(socketAuthMiddleware()); // Initialize Middlewares

    this.socketServer.on("connection", (socket) => {
      const user = (socket.request as SocketRequestWithUser).user;
      socket.join("data");
      socket.on("join", async ({ room }: { room: string }) => {
        socket.join(room);
      });
      socket.on("sendMessage", async ({room, message, type }: {room : string;  message: string; type: MESSAGE_TYPE }) => {   
        await this.chatService.saveChat(
          room,
          user._id.toString(),
          message,
          type
        );  
        
        this.sendEvent(room, "message", {room, message, type, user});
      });
      socket.on("sendGroupMessage", async ({room, message, type }: {room : string;  message: string; type: MESSAGE_TYPE }) => {   
        await this.chatService.saveChat(
          room,
          user._id.toString(),
          message,
          type
        );  
        
        this.sendEvent(room, "groupMessage", {room, message, type, user});
      });
      socket.on("leave", (_) => {});
      socket.on("disconnect", (_) => {});
    });
  }

  private handleChannelMessage(user: User, channelId: string, message: string, type: string, room: string) {
    const data = {};
    this.socketServer.to(room).emit(NOTIFICATION_TYPE.MESSAGE, data);
  }

  public sendEvent(room: string, eventType: string, data: any) {
    try {
      this.socketServer.to(room).emit(eventType, data);
    } catch (error) {
      console.log(error);
    }
  }

  static init(server: http.Server) {
    if (!connection) {
      connection = new SocketApp();
      connection.connect(server);
    }
  }

  static getConnection() {
    if (!connection) {
      throw new Error("no active connection");
    }
    return connection;
  }
}

export function initSocketConnect(server: http.Server) {
  return SocketApp.init(server);
}

export function getSocketConnection() {
  return SocketApp.getConnection();
}
