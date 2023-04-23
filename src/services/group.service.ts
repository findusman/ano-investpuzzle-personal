import * as Papa from "papaparse";
import moment = require("moment");

import { userModel, groupModel, groupuserModel } from "_app/models";
import { NotificationService } from "_app/services";
import { User, GroupUser } from "_app/interfaces";

import { CreateGroupDto, UpdateGroupDto } from "_app/dtos";
import { Env } from "_app/config";
import * as handlebars from "handlebars";
import mongoose from "mongoose";
import {
  HttpException,
} from "_app/exceptions";

export class GroupService {
  public groupuser = groupuserModel;
  public user = userModel;
  public groupData = CreateGroupDto;
  public updategroupData = UpdateGroupDto;
  public group = groupModel;
  public notificationService = new NotificationService();

  static _sharedInstance: GroupService = null;

  static getInstance() {
    if (!GroupService._sharedInstance) {
      GroupService._sharedInstance = new GroupService();
    }
    return GroupService._sharedInstance;
  }

  public async getGroupById(id: string) {
    const query = this.group.findById(id);
    return await query;
  }

  public async getGroupByTitle(groupName: string) {
    return await this.group.findOne({ groupName });
  }

  public async getGroupUserByUserId(user: string) {
    return await this.groupuser.findOne({ user });
  }

  public async getGroupUserByUserIdAndGroupId(user: string, group: string) {
    return await this.groupuser.findOne({ group, user });
  }

  public async createGroup(ownerObj: User, groupdata: CreateGroupDto) {
    const userId = ownerObj._id;
    const userName = ownerObj.userFullName;
    const groupItem = await this.group.create({
      groupName: groupdata.groupName,
      groupPhoto: groupdata.groupPhoto,
      isPublic: groupdata.isPublic,
      owner: new mongoose.Types.ObjectId(userId),
      groupDescription: groupdata.groupDescription,
      createdAt: moment().unix() * 1000,
    });

    await this.groupuser.create({
      user: new mongoose.Types.ObjectId(userId),
      group: new mongoose.Types.ObjectId(groupItem._id),
      isRemoved: 0,
      isInviteAccepted: 1,
      isOwner: 1,
      createdAt: moment().unix() * 1000,
    });

    for (var i = 0; i < groupdata.users.length; i++) {
      await this.groupuser.create({
        user: new mongoose.Types.ObjectId(groupdata.users[i]),
        group: new mongoose.Types.ObjectId(groupItem._id),
        isRemoved: 0,
        isInviteAccepted: 0,
        isOwner: 0,
        createdAt: moment().unix() * 1000,
      });

      await this.notificationService.createNotification(
        userId.toString(),
        groupdata.users[i],
        2,
        groupItem._id,
        userName + " sent you " + groupdata.groupName + " request",
        0
      );
    }
    return groupItem;
  }

  public async updateGroupInfo(ownerObj: User, groupId: string, updategroupData: UpdateGroupDto) {
    const userId = ownerObj._id;
    const userName = ownerObj.userFullName;
    var currentgroup = await this.getGroupById(groupId);
    if (currentgroup.owner.toString() != userId) {
      throw new HttpException(400, "You are not owner of this group");
    } else {
      if (updategroupData.users) {
        var users = updategroupData.users;
        for (var i = 0; i < users.length; i++) {
          var groupUserExist = await this.getGroupUserByUserIdAndGroupId(users[i], groupId);
          if (groupUserExist) {
            if (groupUserExist.isRemoved == 1) {
              await this.groupuser.findByIdAndUpdate(groupUserExist._id.toString(), { isRemoved: 0 });
              await this.notificationService.createNotification(
                userId.toString(),
                users[i],
                2,
                groupId,
                userName + " sent you " + currentgroup.groupName + " request",
                0
              );
            }
          } else {
            await this.groupuser.create({
              user: new mongoose.Types.ObjectId(users[i]),
              group: new mongoose.Types.ObjectId(groupId),
              isRemoved: 0,
              isInviteAccepted: 0,
              isOwner: 0,
              createdAt: moment().unix() * 1000,
            });

            await this.notificationService.createNotification(
              userId.toString(),
              users[i],
              2,
              groupId,
              userName + " sent you " + currentgroup.groupName + " request",
              0
            );
          }
        }

        delete updategroupData.users;
      }
      if (updategroupData.groupPhoto || updategroupData.groupName || updategroupData.groupDescription)
        await this.group.findByIdAndUpdate(groupId, updategroupData);
    }

    return "success";
  }

  public async removeGroup(userId: string, groupId: string) {
    var currentgroup = await this.getGroupById(groupId);
    if (currentgroup) {
      if (currentgroup.owner.toString() != userId.toString()) {
        throw new HttpException(400, "You are not owner of this group");
      } else {
        await this.groupuser.deleteMany({ group: new mongoose.Types.ObjectId(groupId) });
        await this.group.findOneAndDelete({ _id: new mongoose.Types.ObjectId(groupId) });
      }
    } else {
      throw new HttpException(400, "This group doesn't exist");
    }
  }

  public async removeUserFromGroup(userId: string, groupId: string, removingUserId: string) {
    var currentgroup = await this.getGroupById(groupId);
    if (currentgroup) {
      if (userId == removingUserId) {
        throw new HttpException(400, "Group Owner can't be deleted");
      } else {
        if (currentgroup.owner.toString() != userId) {
          throw new HttpException(400, "You are not owner of this group");
        } else {
          var groupUserExist = await this.getGroupUserByUserIdAndGroupId(removingUserId, groupId);
          if (groupUserExist) {
            if (groupUserExist.isRemoved == 1) {
              throw new HttpException(400, "This user already removed from this group");
            } else {
              await this.groupuser.findByIdAndUpdate(groupUserExist._id.toString(), { isRemoved: 1 });
            }
          } else {
            throw new HttpException(400, "This user is not in group");
          }
        }
      }
      return "success";
    } else {
      throw new HttpException(400, "This group doesn't exist");
    }
  }

  public async acceptGroupInvite(userId: string, groupId: string, isAccept: boolean) {
    var currentgroup = await this.getGroupById(groupId);
    if (currentgroup) {
      var groupUserExist = await this.getGroupUserByUserIdAndGroupId(userId, groupId);
      if (groupUserExist) {
        if (groupUserExist.isRemoved == 1) {
          throw new HttpException(400, "This user already removed from this group");
        } else {
          if (groupUserExist.isInviteAccepted == 1) {
            throw new HttpException(400, "You already accepted this invite");
          } else {
            if (isAccept) {
              await this.groupuser.findByIdAndUpdate(groupUserExist._id.toString(), { isInviteAccepted: 1 });
              var notiExist = await this.notificationService.getNotificationBySenerReceiverAndType(
                currentgroup.owner.toString(),
                userId,
                2
              );
              if (notiExist) {
                await this.notificationService.updateNotiAccept(notiExist._id.toString(), 1);
              }
            } else {
              var groupUserExist = await this.getGroupUserByUserIdAndGroupId(userId, groupId);
              if (groupUserExist) {
                if (groupUserExist.isRemoved == 1) {
                  throw new HttpException(400, "This user already removed from this group");
                } else {
                  await this.groupuser.findByIdAndUpdate(groupUserExist._id.toString(), { isRemoved: 1 });
                  var notiExist = await this.notificationService.getNotificationBySenerReceiverAndType(
                    currentgroup.owner.toString(),
                    userId,
                    2
                  );
                  if (notiExist) {
                    await this.notificationService.updateNotiAccept(notiExist._id.toString(), 2);
                  }
                }
              } else {
                throw new HttpException(400, "This user is not in group");
              }
            }
          }
        }
      } else {
        throw new HttpException(400, "This user is not in group");
      }
      return "success";
    } else {
      throw new HttpException(400, "This group doesn't exist");
    }
  }

  public async getGroup(myId: string, groupId: string) {
    const groupData = await this.group.findById(groupId);
    if (groupData) {
      const owner = await this.user.findById(groupData.owner);
      if (owner) {
        const meIncluded = await this.groupuser.findOne({
          user: new mongoose.Types.ObjectId(myId),
          group: new mongoose.Types.ObjectId(groupId),
        });

        const groupUsers = await this.groupuser.aggregate([
          {
            $match: { group: new mongoose.Types.ObjectId(groupId), isRemoved: 0 },
          },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
            },
          },          
          {
            $unwind: "$user",
          }, 
          {
            $addFields: {
              "user.id": "$user._id",
            },
          },         
          { $unset: [ "user.pronoun", "user.education","user.country","user._id"] },
        ]);
        return { group: groupData, owner: owner, meIncluded: meIncluded ? true : false, groupUsers: groupUsers };
      } else {
        throw new HttpException(400, "This group owner doesn't exist");
      }
    } else {
      throw new HttpException(400, "This group doesn't exist");
    }
  }

  public async getUserGroups(user: User) {
    const groups = await this.groupuser.aggregate([
      {
        $match: { user: user._id, isInviteAccepted: 1, isRemoved: 0 },
      },
      {
        $lookup: {
          from: "groups",
          as: "group",
          localField: "group",
          foreignField: "_id",
        },
      },
      {
        $unwind: "$group",
      },
      {
        $lookup: {
          from: "groupusers",
          let: { groupId: "$group._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$group", "$$groupId"] },
                    { $eq: ["$isRemoved", 0] },
                    { $eq: ["$isInviteAccepted", 1] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: "$user",
            },
            {
              $project: {
                _id: 0,
                // isOwner: 1,
                id: "$user._id",
                username: "$user.username",
                userFullName: "$user.userFullName",
                email: "$user.email",
                photoUrl: "$user.photoUrl",
              },
            },
          ],
          as: "users",
        },
      },
      {
        $project: {
          _id: 0,
          id: "$group._id",
          owner : "$group.owner",
          groupName: "$group.groupName",
          groupPhoto: "$group.groupPhoto",
          isPublic: "$group.isPublic",
          groupDescription: "$group.groupDescription",
          createdAt: "$group.createdAt",
          users: 1,
        },
      },
    ]);
    return groups;
  }

  public async getGroups(userId : string, limit: number, page: number, skip: number, query: string | null, orderBy?: string) {
    const filter = query
      ? {
          $or: [
            { groupName: new RegExp(query, "i") },
            { groupDescription: new RegExp(query, "i") },
          ],
        }
      : {};
    const groupsQuery = this.group
      .find(filter)  
      .populate({
        path: "owner",
        select: { userFullName: 1, photoUrl: 1 },
        strictPopulate: false,
      })
      .populate("participants") 
      .populate({
        path: "meincluded",
        match: () => ({ user: userId, isInviteAccepted : 1 }),
      })
      .skip(skip)
      .limit(limit);
    if (orderBy) {
      groupsQuery.sort({ groupName: 1 });
    } else {
      groupsQuery.sort({ createdAt: -1 });
    }
    const total = await this.group.find().merge(groupsQuery).skip(0).limit(null).countDocuments();
    const groups = await groupsQuery;
    return {
      data: groups || [],
      page: Number(page),
      limit: Number(limit),
      total,
    };
  }

  public async joinGroup(userId: string, groupId: string) {
    var currentgroup = await this.getGroupById(groupId);
    if (currentgroup) {
      if(currentgroup.isPublic==1){
        var groupUserExist = await this.getGroupUserByUserIdAndGroupId(userId, groupId);
        if (groupUserExist) {
          if (groupUserExist.isRemoved == 1) {
            //throw new HttpException(400, "This user already removed from this group");
            await this.groupuser.findByIdAndUpdate(groupUserExist._id.toString(), { isRemoved: 0 });
            return "success";
          } else {
            if (groupUserExist.isInviteAccepted == 1) {
              throw new HttpException(400, "You already a member of this group");
            } else {
              await this.groupuser.findByIdAndUpdate(groupUserExist._id.toString(), { isRemoved: 0, isInviteAccepted : 1 });
              return "success";
            }
          }
        } else {
          const groupUser = await this.groupuser.create({
            user: new mongoose.Types.ObjectId(userId),
            group: new mongoose.Types.ObjectId(groupId),
            isRemoved: 0,
            isInviteAccepted: 1,
            isOwner: 0,
            createdAt: moment().unix() * 1000,
          });

          await this.notificationService.createNotification(
            userId,
            currentgroup.owner.toString(),
            12,
            currentgroup._id.toString(),
            "New user added in your group",
            0
          )

          return "success";
        }
      }else{
        throw new HttpException(400, "This is a private group");
      }
    } else {
      throw new HttpException(400, "This group doesn't exist");
    }
  }

  public async requestJoinGroup(userId: string, groupId: string) {
    var currentgroup = await this.getGroupById(groupId);
    if (currentgroup) {
      if(currentgroup.isPublic==1){
        throw new HttpException(400, "This is a public group");
      }else{        
        var groupUserExist = await this.getGroupUserByUserIdAndGroupId(userId, groupId);
        if (groupUserExist) {
          if (groupUserExist.isRemoved == 1) {
            throw new HttpException(400, "This user already removed from this group");
          } else {
            if (groupUserExist.isInviteAccepted == 1) {
              throw new HttpException(400, "You already a member of this group");
            } else {
              throw new HttpException(400, "You already received invite to join in this group. please accept it instead of asking to join");
            }
          }
        } else {
          const notification = await this.notificationService.createNotification(
            currentgroup.owner.toString(),
            userId,
            10,
            currentgroup._id.toString(),
            "group joining request sent",
            0
          )
          return "success";
        }
      }
    } else {
      throw new HttpException(400, "This group doesn't exist");
    }
  }

  public async acceptJoinRequestGroup(myId: string, groupId: string, userId : string, isAccept : boolean, notiId : string) {
    var currentgroup = await this.getGroupById(groupId);
    if (currentgroup) {
      if(currentgroup.isPublic==1){
        throw new HttpException(400, "This is a public group");
      }else{
        if(currentgroup.owner.toString() != myId){
          throw new HttpException(400, "You are not an owner of this group");
        }else{    
          if(isAccept == true){
            await this.notificationService.updateNotiAccept(notiId, 1);

            var groupUserExist = await this.getGroupUserByUserIdAndGroupId(userId, groupId);
            if (groupUserExist) {
              if (groupUserExist.isRemoved == 1) {              
                await this.groupuser.findByIdAndUpdate(groupUserExist._id.toString(), { isRemoved: 0 });
                return "success";
              } else {
                if (groupUserExist.isInviteAccepted == 1) {
                  throw new HttpException(400, "You already a member of this group");
                } else {                
                  await this.groupuser.findByIdAndUpdate(groupUserExist._id.toString(), { isRemoved: 0, isInviteAccepted : 1 });
                  return "success";
                }
              }
            } else {
              await this.groupuser.create({
                user: new mongoose.Types.ObjectId(userId),
                group: new mongoose.Types.ObjectId(groupId),
                isRemoved: 0,
                isInviteAccepted: 1,
                isOwner: 0,
                createdAt: moment().unix() * 1000,
              });
              const notification = await this.notificationService.createNotification(
                myId,
                userId,
                11,
                currentgroup._id.toString(),
                "group joining request has accepeted",
                0
              )
              return "success";
            }

          }else{
            await this.notificationService.updateNotiAccept(notiId, 2);

            var groupUserExist = await this.getGroupUserByUserIdAndGroupId(userId, groupId);
            const notification = await this.notificationService.createNotification(
              myId,
              userId,
              11,
              currentgroup._id.toString(),
              "group joining request has been rejected",
              0
            )
            return "success";
          }    
          
        }
      }
    } else {
      throw new HttpException(400, "This group doesn't exist");
    }
  }
}
