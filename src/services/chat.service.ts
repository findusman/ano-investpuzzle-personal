import * as Papa from "papaparse";
import moment = require("moment");

import { userModel, chatroomModel, chatModel, groupModel } from "_app/models";

import {} from "_app/dtos";
import mongoose from "mongoose";
import {
  HttpException,
} from "_app/exceptions";
export class ChatService {
  public user = userModel;
  public chatRoom = chatroomModel;
  public chat = chatModel;
  public group = groupModel;

  static _sharedInstance: ChatService = null;

  static getInstance() {
    if (!ChatService._sharedInstance) {
      ChatService._sharedInstance = new ChatService();
    }
    return ChatService._sharedInstance;
  }

  public async getChatRoomById(id: string) {
    const query = this.chatRoom.findById(id);
    return await query;
  }

  
  public async getRoomDetail(myId: string, userId: string) {    
    var roomName =  userId+"_"+myId;
    const roomExt1 = await this.chatRoom.findOne({room : roomName});
    if(roomExt1){      
    }else{
      roomName = myId + "_" + userId;
      const roomExt2 = await this.chatRoom.findOne({room : roomName});
      if (roomExt2) {       
      } else {
        await this.chatRoom.create({
          creator: new mongoose.Types.ObjectId(myId),
          user: new mongoose.Types.ObjectId(userId),
          room: roomName,       
          createdAt: moment().unix() * 1000,
        });
      }
    }
    
    var roomData = await this.chatRoom.findOne({room : roomName}).populate('user').populate('creator');
    return roomData;
  }

  public async getRoomDetailById(roomId : string){
    const roomObj = await this.getChatRoomById(roomId);
    if (roomObj) {
      var roomData = await this.chatRoom.findById(roomId).populate('user').populate('creator');
      return roomData;
    } else {
      throw new HttpException(400, "room not exist");
    }    
  }

  public async saveChat(room: string, sender: string, message : string, messageType : string) {
    // var chatItem = await this.chat.create({
    //   sender: new mongoose.Types.ObjectId(sender),
    //   room: new mongoose.Types.ObjectId(room),
    //   message: message,
    //   messageType :messageType,        
    //   createdAt: moment().unix() * 1000,
    // });

    var roomItem = await this.chatRoom.findOneAndUpdate({_id :  new mongoose.Types.ObjectId(room)}, {lastMessageSender : new mongoose.Types.ObjectId(sender),  lastMessage : message, messageType : messageType, updatedAt :  moment().unix() * 1000});
    return roomItem;    
  }

  

  public async getMyChatRooms(
    userId: string,
    limit: number,
    page: number,
    skip: number,
  ) {
    const filter: any = {};
    let filterQuery = [];
    filterQuery.push({ creator: new mongoose.Types.ObjectId(userId) });
    filterQuery.push({ user: new mongoose.Types.ObjectId(userId) });
    filterQuery.length > 0 ? (filter.$or = filterQuery) : null;
    
    const chatRoomsQuery = this.chatRoom
      .find(filter)
      .skip(skip)
      .sort({ updatedAt: -1 })
      .limit(limit)
      
      
      // .populate({ path: "creator" })
      // .populate({ path: "user" });
    const total = await this.chatRoom.find().merge(chatRoomsQuery).skip(0).limit(null).countDocuments();
    const chatRooms = await chatRoomsQuery;
    const data: any[] = [];

    await Promise.all(
      chatRooms.map(async (chatRoomObj : any, index: number) => {
        let creatorId = chatRoomObj.creator;
        let userData;
        if(creatorId.toString() === userId.toString()){          
           userData = await this.user.findById(chatRoomObj.user.toString());
        }else{
           userData = await this.user.findById(creatorId.toString());
        }
        let chatRoom = {...chatRoomObj._doc, id : chatRoomObj._doc._id};

        data.push({ userData,...chatRoom}); 
        
        //console.log();
      })
    );   

    return {
      chatRooms: data || [],
      page: Number(page),
      limit: Number(limit),
      total,
    };
  }

  public async getChatHistory(
    roomId: string,
    limit: number,
    page: number,
    skip: number,
  ) {
    const roomObj = await this.getChatRoomById(roomId);
    if (roomObj) {     
      const chatQuery = this.chat
        .find({room : new mongoose.Types.ObjectId(roomId)})
        .skip(skip)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate({ path: "sender" })
      const total = await this.chatRoom.find().merge(chatQuery).skip(0).limit(null).countDocuments();
      const messages = await chatQuery;
  
      return {
        messages: messages || [],
        page: Number(page),
        limit: Number(limit),
        total,
      };
    } else {
      throw new HttpException(400, "room not exist");
    }    

    
  }

  public async getGroupChatHistory(
    roomId: string,
    limit: number,
    page: number,
    skip: number,
  ) {
    const roomObj = await this.group.findById(roomId);
    if (roomObj) {     
      const chatQuery = this.chat
        .find({room : new mongoose.Types.ObjectId(roomId)})
        .skip(skip)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate({ path: "sender" })
      const total = await this.chatRoom.find().merge(chatQuery).skip(0).limit(null).countDocuments();
      const messages = await chatQuery;
  
      return {
        messages: messages || [],
        page: Number(page),
        limit: Number(limit),
        total,
      };
    } else {
      throw new HttpException(400, "group not exist");
    }    

    
  }
}
