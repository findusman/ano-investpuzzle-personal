import { Request, Response, NextFunction } from "express";

import { HttpException, NotFoundException, WrongCredentialsException } from "_app/exceptions";
import { Controller, RequestWithSignup, RequestWithUser, User } from "_app/interfaces";
import { authMiddleware, registerAuthMiddleware, validationMiddleware } from "_app/middlewares";
import {
  ConfirmCurrentPasswordDto,
  EmailVerifyTokenDto,
  FilterStocklistDto,
  FollowMultiStockDto,
  SaveFcmTokenDto
} from "_app/dtos";
import { getPaginator } from "_app/utils";
import { LoggerFactory } from "_app/factories";

class CommonController extends Controller {
  constructor(loggerFactory: LoggerFactory) {
    super("/common", loggerFactory.getNamedLogger("auth-controller"));
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/getaccessories`,
      this.getProunsEducationCountries
    );

    this.router.post(
      `${this.path}/confirmOtp`,
      validationMiddleware(EmailVerifyTokenDto),
      registerAuthMiddleware({ skipAuthorization: false }),
      this.verifyOtp
    );

    this.router.post(
      `${this.path}/confirmcurrentpassword`,
      validationMiddleware(ConfirmCurrentPasswordDto),
      authMiddleware(),
      this.verifyCurrentPassword
    );

    this.router.get(`${this.path}/getallbadges`, this.getAllBadges);
    this.router.get(`${this.path}/getrankings`, authMiddleware(), this.getRankings);
    this.router.post(`${this.path}/savetoken`, validationMiddleware(SaveFcmTokenDto), authMiddleware(), this.saveToken);
    this.router.get(`${this.path}/recommendedstocks`, authMiddleware(), this.getRecomenedStocks);
    this.router.post(`${this.path}/favoritemultistocks`, validationMiddleware(FollowMultiStockDto), authMiddleware(), this.saveFavMultiStocks);
    this.router.get(`${this.path}/:id/registerbadge`, authMiddleware(), this.registerBadge);


  }


  private verifyOtp = async (request: RequestWithSignup, response: Response, next: NextFunction) => {
    const { code, type }: EmailVerifyTokenDto = request.body;
    if (type == 1) { // signup, forgot code
      try {
        await this._userService.confirmVerificationCode(request.email, request.username, request.code, code, request.token);
        const userData = await this._userService.getUserByEmail(request.email);
        if (userData) {
          if (userData.userType != undefined && userData.userType != null && userData.userType == 0) {
            this._userService.updateEmailVerifiedStatus(userData._id);
            const tokenData = this._authenticationService.createToken(userData);
            userData.jwt = tokenData.token;

            let status = 0;
            if (userData.endOfSubscriptionDate == undefined || userData.endOfSubscriptionDate === null) {
              status = 2; // payment source did not verified
            } else {
              if (userData.endOfSubscriptionDate < new Date()) { // if subscription date is passed
                status = 3; // subscription expired
              } else {
                status = 0;
              }
            }

            response.send({ data: { user: userData, status: status } });
          } else {
            response.send({ message: "Email verification code has been confirmed" });
          }
        } else {
          response.send({ message: "Email verification code has been confirmed" });
        }
      } catch (error) {
        response.status(400).send({ message: "Wrong code" });
      }
    } else {
      response.status(400).send({ message: "Othertype code" });
    }
  };

  private verifyCurrentPassword = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const { currentPassword }: ConfirmCurrentPasswordDto = request.body;
    const currentUser = request.user as User;
    try {
      await this._userService.confirmCurrentPassword(currentUser, currentPassword);
      response.send({ message: "Current password is correct" });
    } catch (error) {
      next(error);
    }

  };

  private saveToken = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const { token }: SaveFcmTokenDto = request.body;
    const currentUser = request.user as User;
    try {
      await this._userService.saveToken(currentUser, token);
      response.send({ message: "Update token success" });
    } catch (error) {
      next(error);
    }

  };

  private getProunsEducationCountries = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const data = await this._accessoriesService.getProunsEducationCountries();
      response.send({ message: "success", data });
    } catch (error) {
      next(error);
    }
  };

  private saveFavMultiStocks = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const { stockIds }: FollowMultiStockDto = request.body;
      const currentUser = request.user as User;
      const data = await this._stockService.saveFavMultiStocks(currentUser, stockIds);
      response.send({ message: "success" });
    } catch (error) {
      next(error);
    }
  };


  private registerBadge = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const userId = request.params.id;
      const badgeId = "63831fc14048f518d9eb11a5";// "63831fc14048f518d9eb11a3";
      const receivedBadgeObj = await this._badgeService.registerReceivedBadge(badgeId, userId);
      response.send({ message: "badge saved successfully", receivedBadge: receivedBadgeObj });
    } catch (error) {
      next(error);
    }
  };

  private getAllBadges = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const data = await this._badgeService.getAllBadges();
      response.send({ message: "success", data });
    } catch (error) {
      console.log(error);
      response.status(400).send({ message: "Wrong code" });
    }
  };

  private getRecomenedStocks = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const data = await this._stockService.getRecomenedStocks();
      response.send({ message: "success", data });
    } catch (error) {
      console.log(error);
      response.status(400).send({ message: "Wrong request" });
    }
  };

  private getRankings = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const { page, skip, limit, keyword } = getPaginator(request);
      const data = await this._stockService.getRankings(
        currentUser._id,
        currentUser.professor as unknown as User,
        limit,
        page,
        skip,
        keyword,
      );
      response.send({ data });
    } catch (error) {
      next(error);
    }
  };


}

export default CommonController;
