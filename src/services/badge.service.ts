import * as Papa from "papaparse";
import moment = require("moment");

import { badgeModel, userBadgeModel, userModel, notificationModel } from "_app/models";
import { NotificationService } from "_app/services";

import {} from "_app/dtos";
import { Env } from "_app/config";
import * as handlebars from "handlebars";
import mongoose from "mongoose";
import {
  AlreadyExistsException,
  HttpException,
  NotAuthorizedException,
  NotFoundException,
  UserAlreadyExistsException,
  WrongAuthenticationTokenException,
} from "_app/exceptions";
import { Badge, UserBadge } from "_app/interfaces";

export class BadgeService {
  public user = userModel;
  public badge = badgeModel;
  public receivedBadge = userBadgeModel;
  public notification = notificationModel;

  public notificationService = new NotificationService();

  static _sharedInstance: BadgeService = null;

  static getInstance() {
    if (!BadgeService._sharedInstance) {
      BadgeService._sharedInstance = new BadgeService();
    }
    return BadgeService._sharedInstance;
  }

  public async getBadgeById(id: string) {
    const query = this.badge.findById(id);
    return await query;
  }

  public async getBadgeByTitle(title: string) {
    return await this.badge.findOne({ title });
  }

  public async getReceivedBadgeById(id: string) {
    const query = this.receivedBadge.findById(id);
    return await query;
  }

  public async registerReceivedBadge(
    badgeId: string,
    userId: string,
  ) {
    const badgeExistForThisUser = await this.receivedBadge.findOne({badge :  new mongoose.Types.ObjectId(badgeId), user : new mongoose.Types.ObjectId(userId)});
    if(badgeExistForThisUser){
      throw new HttpException(400, "This user already received this badge");
    }else{
      const receivedBadgeItem = await this.receivedBadge.create({
        badge: new mongoose.Types.ObjectId(badgeId),
        user:  new mongoose.Types.ObjectId(userId) ,
        createdAt: moment().unix() * 1000,
      });
      await this.notificationService.createNotification(
        userId.toString(),
        userId.toString(),
        7,
        "",
        "Congratulation! you earned a new badge",
        1
      );
      return receivedBadgeItem;
    } 
  }

 

  public async getAllBadges() {
    return await this.badge.find();
  }

  public async getUserBadges(
    userId: string,
  ) {
    let availableBadges = await this.badge.find();    
    const userBadges = await Promise.all(availableBadges.map(async (oneBadge: Badge, i) => {
      const userReceivedThisBadge = await this.receivedBadge.findOne({user :new mongoose.Types.ObjectId(userId), badge : oneBadge._id});
      if(userReceivedThisBadge){
        oneBadge.isReceived = true;
        oneBadge.receivedAt = userReceivedThisBadge.createdAt;
        return oneBadge;
      }else{
        return oneBadge;
      }          
    }));
    return userBadges;
  }
}
