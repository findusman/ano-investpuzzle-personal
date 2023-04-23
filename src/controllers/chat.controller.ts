import { Request, Response, NextFunction } from "express";
import { NotFoundException } from "_app/exceptions";
import { Controller, RequestWithUser, User } from "_app/interfaces";
import { authMiddleware, queryIdValidator, queryMiddleware, validationMiddleware } from "_app/middlewares";
import { ChatMessageDto, FollowMultiStockDto, GetRoomDataDto } from "_app/dtos";
import { LoggerFactory } from "_app/factories";
import { isObjectIdOrHexString } from "mongoose";
import { getPaginator } from "_app/utils";

class ChatController extends Controller {
  constructor(loggerFactory: LoggerFactory) {
    super("/chat", loggerFactory.getNamedLogger("chat-controller"));
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/getroom`,
      validationMiddleware(GetRoomDataDto),
      authMiddleware({ skipAuthorization: false }),
      this.getRoomData
    );

    this.router.post(
      `${this.path}/:id/roomdetail`,
      authMiddleware({ skipAuthorization: false }),
      this.getRoomDataById
    );

    
    this.router.post(
      `${this.path}/savemessage`,
      validationMiddleware(ChatMessageDto),
      authMiddleware({ skipAuthorization: false }),
      this.saveChatMessage
    );

    
    this.router.get(`${this.path}/contacts`, authMiddleware({ skipAuthorization: false }), this.getChatRooms);
    this.router.get(`${this.path}/:id/history`, authMiddleware({ skipAuthorization: false }), this.getHistory);
    this.router.get(`${this.path}/:id/groupmessage`, authMiddleware({ skipAuthorization: false }), this.getGroupHistory);
  }

  private getRoomData = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const myId = currentUser._id.toString();
      const { user } = request.body as GetRoomDataDto;
     
        const data = await this._chatService.getRoomDetail(myId, user);
        response.status(200).send({ message: "success", data : data });
      
    } catch (error) {
      next(error);
    }
  };

  private getRoomDataById = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const roomId = request.params.id;
     
      const data = await this._chatService.getRoomDetailById(roomId);
      response.status(200).send({ message: "success", data : data });
      
    } catch (error) {
      next(error);
    }
  };

  private saveChatMessage = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const myId = currentUser._id.toString();
      const { sender, room, message, messageType } = request.body as ChatMessageDto;
     
        const data = await this._chatService.saveChat(room, sender, message, messageType);
        response.status(200).send({ message: "success", data : data });
      
    } catch (error) {
      next(error);
    }
  };

  

  private getChatRooms = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const { page, skip, limit } = getPaginator(request);
      const data = await this._chatService.getMyChatRooms(currentUser._id, limit, page, skip);
      response.send(data);
    } catch (error) {
      next(error);
    }
  };

  private getHistory = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const roomId = request.params.id;
      const { page, skip, limit } = getPaginator(request);
      const data = await this._chatService.getChatHistory(roomId, limit, page, skip);
      response.send(data);
    } catch (error) {
      next(error);
    }
  };

  private getGroupHistory = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const roomId = request.params.id;
      const { page, skip, limit } = getPaginator(request);
      const data = await this._chatService.getGroupChatHistory(roomId, limit, page, skip);
      response.send(data);
    } catch (error) {
      next(error);
    }
  };

  
}

export default ChatController;
