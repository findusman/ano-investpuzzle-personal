import * as Papa from "papaparse";
import moment = require("moment");

import { userModel, notificationModel, groupModel } from "_app/models";

import {} from "_app/dtos";
import { Env } from "_app/config";
import mongoose from "mongoose";
import {
  HttpException,
} from "_app/exceptions";
import axios from "axios";

export class NotificationService {
  public user = userModel;
  public notification = notificationModel;
  public group = groupModel;

  static _sharedInstance: NotificationService = null;

  static getInstance() {
    if (!NotificationService._sharedInstance) {
      NotificationService._sharedInstance = new NotificationService();
    }
    return NotificationService._sharedInstance;
  }

  public async getNotificationById(id: string) {
    const query = this.notification.findById(id);
    return await query;
  }

  public async getNotificationBySender(sender: string) {
    return await this.notification.findOne({ sender });
  }

  public async getNotificationByReceiver(receiver: string) {
    return await this.notification.findOne({ receiver });
  }

  public async getNotificationBySenerReceiverAndType(sender: string, receiver: string, type: number) {
    return await this.notification.findOne({ sender, receiver, type });
  }

  public async removeNotification(userId: string, notiId: string) {
    const notiObj = await this.getNotificationById(notiId);
    if (notiObj) {
      if (userId.toString() != notiObj.receiver.toString()) {
        throw new HttpException(400, "This isn't your notification");
      } else {
        return await this.notification.findByIdAndDelete(notiId);
      }
    } else {
      throw new HttpException(400, "This notification doesn't exist");
    }
  }

  public async updateNotiReadStatus(userId: string, notiIds: string[]) {
    for (var i = 0; i < notiIds.length; i++) {
      const notiObj = await this.getNotificationById(notiIds[i]);
      if (notiObj) {
        if (userId.toString() === notiObj.receiver.toString()) {
          await this.notification.findByIdAndUpdate(new mongoose.Types.ObjectId(notiIds[i]), { isRead: 1 });
        }
      }
    }
  }

  public async createNotification(
    sender: string,
    receiver: string,
    type: number,
    linkedId: string,
    content: string,
    isAccepted: number
  ) {
    const notificationItem = await this.notification.create({
      type: type,
      sender: sender.length > 0 ? new mongoose.Types.ObjectId(sender) : null,
      receiver: new mongoose.Types.ObjectId(receiver),
      linkedId: linkedId, // group id, user id , something else, comment id what ever
      content: content,
      isRead: 0,
      isAccept: isAccepted,
      createdAt: moment().unix() * 1000,
    });

    const userData = await this.user.findById(receiver);
    if(userData && userData.token != null){
      let notiContent;
      switch (type) {
        case 0:
          const senderData = await this.user.findById(sender);
          notiContent = senderData.userFullName + " wants to follow you";
          break;
        case 1:          
          const senderData1 = await this.user.findById(sender);
          notiContent = senderData1.userFullName + " accepted your follow request";    
          break;
        case 2:
          notiContent = content;    
          break;
        case 3:
          const senderData3 = await this.user.findById(sender);
          notiContent = senderData3.userFullName + " accepted your group request";  
          break;
        case 4:
          const senderData4 = await this.user.findById(sender);
          notiContent = senderData4.userFullName + " posted a new Forum";            
          break; 
        case 5:
          const senderData5 = await this.user.findById(sender);
          notiContent = senderData5.userFullName + " commented on your post on forums";            
          break;   
        case 6:
          const senderData6 = await this.user.findById(sender);
          notiContent = senderData6.userFullName + " liked on your post on forums";            
          break;
        case 7:         
          notiContent = "Congratulation! You earned a new badge";            
          break;  
        case 8:
          const senderData8 = await this.user.findById(sender);
          notiContent = senderData8.userFullName + " liked on your comment";            
          break;
        case 9:
          const senderData9 = await this.user.findById(sender);
          notiContent = senderData9.userFullName + " replied on your comment";            
          break;
        case 10:
          const senderData10 = await this.user.findById(sender);
          notiContent = senderData10.userFullName + " sent a request to join on your private group";            
          break;
        case 11:
          const senderData11 = await this.user.findById(sender);
          notiContent = senderData11.userFullName + " accepted your group join request";            
          break;
        case 10:
          notiContent = "New user added in your group";            
          break;      
      }   
      await this.sendPushNotification(userData.token, "WaffleStock Notification", notiContent, "1");
    }
    return notificationItem;
  }

  public async sendPushNotification(token : string, title : string, content : string, unread : string){   
    const url = "https://fcm.googleapis.com/fcm/send";
   
    const notification ={
                            body : content,
                            title : title,
                            sound : "notisound.mp3",                              
                        };
                   
    const notiData = {
                    body : content,
                    title : title,
                    sound : "notisound.mp3",
                    // "badge" => $unread,
                    // "type" => $type,
                  };
    
    const config = {
                    headers:{
                      'Content-Type': 'application/json',
                      'Authorization' : `key=${Env.FIREBASE_PUSH_API_KEY}`
                    }
                  };  
    try {
      const { data }: any = await axios.post(
        url,
        {
          to: token,
          priority: "high",
          notification : notification,
          data : notiData,
        },
        config
      );    
      //console.log(data); 
    } catch (error) {
      console.log(error);
    }
}

  public async updateNotiAccept(_id: string, isAccept: number) {
    return await this.notification.findOneAndUpdate({ _id }, { isAccept });
  }

  public async getMyNotifications(
    userId: string,
    limit: number,
    page: number,
    skip: number,
    keyword: string,
    filterType: number,
    orderBy?: string
  ) {
    const filter =
      filterType != -1
        ? {
            receiver: new mongoose.Types.ObjectId(userId),
            type: filterType,
          }
        : { receiver: new mongoose.Types.ObjectId(userId) };
    const notificationQuery = this.notification
      .find(filter)
      .skip(skip)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({ path: "sender" });
    const total = await this.notification.find().merge(notificationQuery).skip(0).limit(null).countDocuments();
    const notifications = await notificationQuery;
    let notiObjects : any[] = [];
    await Promise.all(
      notifications.map(async (noti: any) => {
        if(noti.type == 2){
          const groupInfo = await this.group.findOne({_id : noti.linkedId});          
          noti.groupData = groupInfo;
          // console.log(groupInfo);
          // console.log(noti);       
        };
        notiObjects.push(noti);
      })
    );

    return {
      notifications: notiObjects || [],
      page: Number(page),
      limit: Number(limit),
      total,
    };
  }
}
