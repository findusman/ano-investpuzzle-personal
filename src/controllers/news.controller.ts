import { Request, Response, NextFunction } from "express";
import { NotFoundException } from "_app/exceptions";
import { Controller, RequestWithUser, User } from "_app/interfaces";
import { authMiddleware, queryIdValidator, queryMiddleware, validationMiddleware } from "_app/middlewares";
import { ChatMessageDto, FollowMultiStockDto, GetRoomDataDto } from "_app/dtos";
import { LoggerFactory } from "_app/factories";
import { isObjectIdOrHexString } from "mongoose";
import { getPaginator } from "_app/utils";

class NewsController extends Controller {
  constructor(loggerFactory: LoggerFactory) {
    super("/news", loggerFactory.getNamedLogger("chat-controller"));
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/ipo`, authMiddleware({ skipAuthorization: false }), this.getIpo);
    this.router.get(`${this.path}/marketnews`, authMiddleware({ skipAuthorization: false }), this.getMarketNews);

  }
  private getIpo = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const myId = currentUser._id.toString();

      const data = await this._newsService.getIpos(myId);
      response.status(200).send({ message: "success", data: data });

    } catch (error) {
      next(error);
    }
  };

  private getMarketNews = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const { page, skip, limit } = getPaginator(request);
      const data = await this._newsService.getMarketNews(
        limit,
        page,
        skip
      );
      response.send({ data: data });
    } catch (error) {
      next(error);
    }
  };
}

export default NewsController;
