import { Request, Response, NextFunction } from "express";
import { Controller, RequestWithUser, User } from "_app/interfaces";
import { authMiddleware, queryMiddleware, validationMiddleware } from "_app/middlewares";
import { LoggerFactory } from "_app/factories";
import { getPaginator } from "_app/utils";
import { NotFoundException } from "_app/exceptions";
import { ReadNotificationDto, TestNotiDto } from "_app/dtos";
import { isObjectIdOrHexString } from "mongoose";

class NotificationController extends Controller {
  constructor(loggerFactory: LoggerFactory) {
    super("/notifications", loggerFactory.getNamedLogger("group-controller"));
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware(), this.getNotifications);
    this.router.put(
      `${this.path}/`,
      authMiddleware(),
      validationMiddleware(ReadNotificationDto),
      this.updateNotificationStatus
    );
    this.router.delete(`${this.path}/:id`, authMiddleware(), this.deleteNotification);
    this.router.post(`${this.path}/sendtestnotification`,  validationMiddleware(TestNotiDto), this.sendTestNoti);
  }

  private deleteNotification = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const notiId = request.params.id;
    try {
      await this._notificationService.removeNotification(currentUser._id, notiId);
      response.send({ data: { message: "Notification Item has been removed successfully" } });
    } catch (error) {
      next(error);
    }
  };

  private updateNotificationStatus = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const notiIds = request.body as ReadNotificationDto;
    try {
      await this._notificationService.updateNotiReadStatus(currentUser._id, notiIds.notiIds);
      response.send({ data: { message: "Notifications status has been update successfully" } });
    } catch (error) {
      next(error);
    }
  };

  private getNotifications = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const { page, limit, skip, pageToken, keyword, filterType, myfollowonly, orderBy } = getPaginator(request);
      const data = await this._notificationService.getMyNotifications(
        currentUser._id,
        limit,
        page,
        skip,
        keyword,
        filterType,
        orderBy.toString()
      );
      response.send({ data: data });
    } catch (error) {
      next(error);
    }
  };

  private sendTestNoti = async (request: RequestWithUser, response: Response, next: NextFunction) => { 
    try {
      const { token } = request.body as TestNotiDto;
      const title = "Hello World";
      const content = "AADSFSDFSDF";
      await this._notificationService.sendPushNotification(token, title , content , "1");
      response.send({ data: { message: "Notifications status has been update successfully" } });
    } catch (error) {
      next(error);
    }
  };

}



export default NotificationController;
