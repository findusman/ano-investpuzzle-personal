import { Request, Response, NextFunction } from "express";
import { Controller, RequestWithUser, User } from "_app/interfaces";
import { authMiddleware, queryMiddleware, validationMiddleware } from "_app/middlewares";
import { LoggerFactory } from "_app/factories";
import { getGroupPaginator, getPaginator } from "_app/utils";
import { NotFoundException } from "_app/exceptions";
import { CreateGroupDto, UpdateGroupDto, RemoveuserDto, AcceptGroupInviteDto, AcceptGroupJoinDto } from "_app/dtos";
import { isObjectIdOrHexString } from "mongoose";

class GroupController extends Controller {
  constructor(loggerFactory: LoggerFactory) {
    super("/groups", loggerFactory.getNamedLogger("group-controller"));
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/`, authMiddleware(), validationMiddleware(CreateGroupDto), this.createGroup);
    this.router.get(`${this.path}/:id`, authMiddleware(), this.getGroup);
    this.router.get(`${this.path}/`, authMiddleware(), this.getGroups);
    this.router.put(`${this.path}/:id`, authMiddleware(), validationMiddleware(UpdateGroupDto), this.updateGroup);
    this.router.get(`${this.path}/:id/join`, authMiddleware(), this.joinGroup);
    this.router.get(`${this.path}/:id/requestjoin`, authMiddleware(), this.requestJoinGroup);
    this.router.post(`${this.path}/:id/acceptjoinrequest`, authMiddleware(), validationMiddleware(AcceptGroupJoinDto), this.acceptJoinRequest);
    this.router.delete(`${this.path}/:id`, authMiddleware(), this.deleteGroup);
    this.router.delete(
      `${this.path}/:id/user`,
      authMiddleware(),
      validationMiddleware(RemoveuserDto),
      this.removeUserFromGroup
    );
    this.router.post(
      `${this.path}/:id/accept`,
      authMiddleware(),
      validationMiddleware(AcceptGroupInviteDto),
      this.acceptGroupInvite
    );
  }

  private getGroups = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {      
      const currentUser = request.user as User;
      const { page, skip, limit, keyword, filterType, myfollowonly, orderBy } = getPaginator(request);
      const data = await this._groupService.getGroups(
        currentUser._id,
        limit,
        page,
        skip,
        keyword,
        orderBy.toString()
      );
      response.send( data );      
    } catch (error) {
      next(error);
    }
  };

  private createGroup = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const groupData = request.body as CreateGroupDto;
    try {
      const groupItem = await this._groupService.createGroup(currentUser, groupData);
      response.send({ data: { message: "Group create success" } });
    } catch (error) {
      next(error);
    }
  };

  private updateGroup = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const groupData = request.body as UpdateGroupDto;
    const groupId = request.params.id;
    try {
      const groupItem = await this._groupService.updateGroupInfo(currentUser, groupId, groupData);
      response.send({ data: { message: "Group update success" } });
    } catch (error) {
      next(error);
    }
  };

  private removeUserFromGroup = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const removingUserData = request.body as RemoveuserDto;
    const groupId = request.params.id;
    try {
      const groupItem = await this._groupService.removeUserFromGroup(currentUser._id, groupId, removingUserData.user);
      response.send({ data: { message: "User removed successfully" } });
    } catch (error) {
      next(error);
    }
  };

  private acceptGroupInvite = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const groupId = request.params.id;
    const groupData = request.body as AcceptGroupInviteDto;
    try {
      const groupItem = await this._groupService.acceptGroupInvite(currentUser._id, groupId, groupData.isAccept);
      if (groupData.isAccept) response.send({ data: { message: "Accepted Group Invite successfully" } });
      else response.send({ data: { message: "Rejected Group Invite successfully" } });
    } catch (error) {
      next(error);
    }
  };

  private deleteGroup = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const groupId = request.params.id;
    try {
      await this._groupService.removeGroup(currentUser._id, groupId);
      response.send({ data: { message: "Group has been removed successfully" } });
    } catch (error) {
      next(error);
    }
  };

  private getGroup = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const groupId = request.params.id;
    try {
      const { group, owner, meIncluded, groupUsers } = await this._groupService.getGroup(currentUser._id, groupId);
      response.send({ data: { group, owner, meIncluded, groupUsers } });
    } catch (error) {
      next(error);
    }
  };

  private joinGroup = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const groupId = request.params.id;
    try {
      const groupItem = await this._groupService.joinGroup(currentUser._id, groupId);
      response.send({ data: { message: "Joined in group successfully" } });      
    } catch (error) {
      next(error);
    }
  };
  
  private requestJoinGroup = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const groupId = request.params.id;
    try {
      const groupItem = await this._groupService.requestJoinGroup(currentUser._id, groupId);
      response.send({ data: { message: "Group join request has been sent scuccessfully" } }); 
    } catch (error) {
      next(error);
    }
  };

  private acceptJoinRequest = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const groupId = request.params.id;
    const {user, notiId ,isAccept} = request.body as AcceptGroupJoinDto;
    try {
      const groupItem = await this._groupService.acceptJoinRequestGroup(currentUser._id, groupId, user, isAccept, notiId);
      response.send({ data: { message: "Group join request has been accepted" } }); 
    } catch (error) {
      next(error);
    }
  };
}



export default GroupController;
