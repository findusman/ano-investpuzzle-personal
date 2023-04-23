import { Request, Response, NextFunction } from "express";

import { Controller, RequestWithUser, User } from "_app/interfaces";
import { authMiddleware, queryIdValidator, queryMiddleware, validationMiddleware } from "_app/middlewares";
import { LoggerFactory } from "_app/factories";
import { getPaginator } from "_app/utils";
import { NotFoundException } from "_app/exceptions";
import { GetStudentsDto, UpdateProfileDto, UserFollowDto } from "_app/dtos";
import { isObjectIdOrHexString } from "mongoose";

class UserController extends Controller {
  constructor(loggerFactory: LoggerFactory) {
    super("/users", loggerFactory.getNamedLogger("user-controller"));
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/me`, authMiddleware(), this.getUser);
    this.router.put(`${this.path}/`, authMiddleware(), validationMiddleware(UpdateProfileDto), this.updateProfile);
    this.router.delete(`${this.path}/`, authMiddleware(), this.deleteUser);
    this.router.get(`${this.path}/:id`, authMiddleware(), this.getUserProfile);
    this.router.post(`${this.path}/:id/follow`, validationMiddleware(UserFollowDto), authMiddleware(), this.followUser);
    this.router.post(`${this.path}/:id/students`, validationMiddleware(GetStudentsDto), authMiddleware(), this.getStudents);
    this.router.post(`${this.path}/:id/updatestatus`, validationMiddleware(GetStudentsDto), authMiddleware(), this.updateStudentStatus);
    this.router.get(`${this.path}/:id/blockfollow`, authMiddleware(), this.removeFollowingUser);
    this.router.post(
      `${this.path}/:id/acceptfollow`,
      validationMiddleware(UserFollowDto),
      authMiddleware(),
      this.acceptFollowUser
    );
    this.router.get(`${this.path}/:id/followers`, authMiddleware(), this.getUserFollowers);
    // this.router.get(`${this.path}/:id/followings`, authMiddleware(), this.getUserFollowings);
    this.router.get(`${this.path}/:id/groups`, authMiddleware(), this.getUserGroups);
    this.router.get(`${this.path}/:id/followings`, authMiddleware(), this.getFollowings);
    this.router.get(`${this.path}/:id/holdings`, authMiddleware(), this.getHoldings);
    this.router.get(`${this.path}/:id/return`, authMiddleware(), this.getReturn);
    this.router.get(`${this.path}/:id/return/graph`, authMiddleware(), this.getReturnGraphData);
    this.router.get(`${this.path}/:id/ranking`, authMiddleware(), this.getRanking);
    this.router.get(`${this.path}/:id/badges`, authMiddleware(), this.userBadges);
    this.router.get(`${this.path}/:id/portfolioanalysis`, authMiddleware(), this.userPortfolioAnalysis);
    this.router.get(`${this.path}/:id/geographicalbreakdown`, authMiddleware(), this.userGeographicalBreakdown);
    this.router.get(`${this.path}/`, authMiddleware(), this.filterUsers);
  }

  private getUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user;
    if (currentUser) {
      response.send({ data: { user: currentUser } });
    } else {
      next(new NotFoundException("User"));
    }
  };

  private updateProfile = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const profileData = request.body as UpdateProfileDto;
    try {
      const user = await this._userService.updateProfile(currentUser._id, currentUser.passwordHash, profileData);
      response.send({ data: { user } });
    } catch (error) {
      next(error);
    }
  };

  private deleteUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user;
    await this._userService.deleteUser(currentUser._id);
    response.status(204).send();
  };

  private followUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const { follow } = request.body as UserFollowDto;
      const id = request.params.id;
      const user = await (isObjectIdOrHexString(id)
        ? this._userService.getUserById(id)
        : this._userService.getUserByUsername(id));
      if (user) {
        await this._userService.followUser(follow, user._id, currentUser._id, currentUser.userFullName);
        response.status(200).send({ message: "successfully saved" });
      } else {
        next(new NotFoundException("User"));
      }
    } catch (error) {
      next(error);
    }
  };


  private removeFollowingUser = async (request: RequestWithUser, response: Response, next: NextFunction) => { // from leader side
    try {
      const currentUser = request.user as User;
      const id = request.params.id;
      const user = await (isObjectIdOrHexString(id)
        ? this._userService.getUserById(id)
        : this._userService.getUserByUsername(id));
      if (user) {
        await this._userService.blockFollowUser(currentUser._id, user._id, currentUser.userFullName);
        response.status(200).send({ message: "successfully blocked" });
      } else {
        next(new NotFoundException("User"));
      }
    } catch (error) {
      next(error);
    }
  };

  private acceptFollowUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const { follow } = request.body as UserFollowDto;
      const id = request.params.id;
      const user = await (isObjectIdOrHexString(id)
        ? this._userService.getUserById(id)
        : this._userService.getUserByUsername(id));
      if (user) {
        await this._userService.acceptFollowuser(follow, currentUser._id, user._id);
        response.status(200).send({ message: "successfully saved" });
      } else {
        next(new NotFoundException("User"));
      }
    } catch (error) {
      next(error);
    }
  };

  private getUserFollowers = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const checkingUserId = request.params.id;
      //const checkingUser = await this._userService.getUserById(checkingUserId);

      const { page, skip, limit, keyword, filterType, myfollowonly, orderBy } = getPaginator(request);
      const data = await this._userService.getFollowers(
        currentUser._id,
        checkingUserId,
        limit,
        page,
        skip,
        keyword,
        orderBy.toString()
      );
      response.send({ data: data });
    } catch (error) {
      next(error);
    }
  };

  private filterUsers = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;

      const { page, skip, limit, keyword, filterType, myfollowonly, orderBy } = getPaginator(request);
      const data = await this._userService.getUsers(
        currentUser._id,
        limit,
        page,
        skip,
        keyword,
        orderBy.toString()
      );
      response.send(data);
    } catch (error) {
      next(error);
    }
  };


  private getStudents = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const { studentStatus } = request.body as GetStudentsDto;
      const id = request.params.id;
      const user = await (isObjectIdOrHexString(id)
        ? this._userService.getUserById(id)
        : this._userService.getUserByUsername(id));
      if (user) {
        const students = await this._userService.getAllUsersOfProfessor(user._id, studentStatus);
        response.status(200).send({ students });
      } else {
        next(new NotFoundException("User"));
      }
    } catch (error) {
      next(error);
    }
  };

  private updateStudentStatus = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const { studentStatus } = request.body as GetStudentsDto;
      const id = request.params.id;
      const user = await (isObjectIdOrHexString(id)
        ? this._userService.getUserById(id)
        : this._userService.getUserByUsername(id));
      if (user) {
        //if (user.professor === currentUser._id.toString()) {
        await this._userService.updateUserStatus(user, studentStatus == 0 ? false : true);
        response.status(200).send({ "message": "success" });
        // } else {
        //   next(new NotFoundException("User"));
        // }
      } else {
        next(new NotFoundException("User"));
      }
    } catch (error) {
      next(error);
    }
  };

  private getUserFollowings = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const checkingUserId = request.params.id;
      const { page, skip, limit, keyword, filterType, myfollowonly, orderBy } = getPaginator(request);
      const data = await this._userService.getFollowings(
        currentUser._id,
        checkingUserId,
        limit,
        page,
        skip,
        keyword,
        orderBy.toString()
      );
      response.send({ data: data });
    } catch (error) {
      next(error);
    }
  };

  private getUserProfile = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const id = request.params.id;
      console.log(id)
      const user = await (isObjectIdOrHexString(id)
        ? this._userService.getUserById(id, request.user?._id)
        : this._userService.getUserByUsername(id));
      if (user) {
        const totalHolding = await this._userService.getuserTotalHolding(id);
        const inceptionStock = await this._userService.getInceptionDate(id);
        response.send({ data: { user: user, totalHolding: totalHolding, inceptionStock: inceptionStock } });
      } else {
        next(new NotFoundException("User"));
      }
    } catch (error) {
      next(error);
    }
  };

  private getUserGroups = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const userId = request.params.id;
      const user = await (isObjectIdOrHexString(userId)
        ? this._userService.getUserById(userId, request.user?._id)
        : this._userService.getUserByUsername(userId));
      if (user) {
        const groups = await this._groupService.getUserGroups(user);
        response.send({ data: { groups } });
      } else {
        next(new NotFoundException("User"));
      }
    } catch (error) {
      next(error);
    }
  };

  private getFollowings = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const userId = request.params.id;
      const user = await (isObjectIdOrHexString(userId)
        ? this._userService.getUserById(userId, request.user?._id)
        : this._userService.getUserByUsername(userId));
      if (user) {
        const stocks = await this._stockService.getFollowedStocks(user);
        const users = await this._userService.getFollowedUsers(user);
        const all = [...stocks, ...users].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        response.send({ all, stocks, users });
      } else {
        next(new NotFoundException("User"));
      }
    } catch (error) {
      next(error);
    }
  };

  private getHoldings = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const userId = request.params.id;
      const user = await (isObjectIdOrHexString(userId)
        ? this._userService.getUserById(userId, request.user?._id)
        : this._userService.getUserByUsername(userId));
      if (user) {
        const { cashPercent, holdings } = await this._stockService.getHoldings(user);
        response.send({ cashPercent, holdings });
      } else {
        next(new NotFoundException("User"));
      }
    } catch (error) {
      next(error);
    }
  };

  private getReturn = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const userId = request.params.id;
      const user = await (isObjectIdOrHexString(userId)
        ? this._userService.getUserById(userId, request.user?._id)
        : this._userService.getUserByUsername(userId));
      if (user) {
        const returns = await this._stockService.getReturn(user, 2);
        response.send({ returns });
      } else {
        next(new NotFoundException("User"));
      }
    } catch (error) {
      next(error);
    }
  };

  private getReturnGraphData = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const userId = request.params.id;
      const user = await (isObjectIdOrHexString(userId)
        ? this._userService.getUserById(userId, request.user?._id)
        : this._userService.getUserByUsername(userId));
      if (user) {
        const { returnData, returns } = await this._returnService.getReturnGraphData(user);
        response.send({ returnData, returns });
      } else {
        next(new NotFoundException("User"));
      }
    } catch (error) {
      next(error);
    }
  };

  private getRanking = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const userId = request.params.id;
      const user = await (isObjectIdOrHexString(userId)
        ? this._userService.getUserById(userId, request.user?._id)
        : this._userService.getUserByUsername(userId));
      if (user) {
        const ranking = await this._stockService.getRanking(user);
        response.send({ ranking });
      } else {
        next(new NotFoundException("User"));
      }
    } catch (error) {
      next(error);
    }
  };

  private userBadges = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const userId = request.params.id;
    try {
      const badges = await this._badgeService.getUserBadges(userId);
      response.send({ message: "success", data: { badges } });
    } catch (error) {
      next(error);
    }
  };

  private userGeographicalBreakdown = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const userId = request.params.id;
    try {
      const data = await this._userService.getUserGeographicalBreakdown(userId);
      response.send({ message: "success", data });
    } catch (error) {
      next(error);
    }
  };

  private userPortfolioAnalysis = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const userId = request.params.id;
    try {
      const data = await this._userService.getUserPortfolioAnalysis(userId);
      response.send({ message: "success", data });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
