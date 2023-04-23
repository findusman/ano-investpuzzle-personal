import { Request, Response, NextFunction } from "express";

import { Controller, RequestWithUser, User } from "_app/interfaces";
import { authMiddleware, queryMiddleware, validationMiddleware } from "_app/middlewares";
import { LoggerFactory } from "_app/factories";
import { getPaginator } from "_app/utils";
import { NotFoundException } from "_app/exceptions";
import { TradeDto } from "_app/dtos";
import { isObjectIdOrHexString } from "mongoose";
import { ResetPasswordResponse } from "aws-sdk/clients/workmail";

class TradeController extends Controller {
  constructor(loggerFactory: LoggerFactory) {
    super("/trades", loggerFactory.getNamedLogger("trade-controller"));
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/`, authMiddleware(), validationMiddleware(TradeDto), this.createTrade);
    this.router.get(`${this.path}/:id/getInvestedSectors`, authMiddleware(), this.getInvestedSctors);
    this.router.get(`${this.path}/:id/getTop5Holdings`, authMiddleware(), this.getTop5Holdings);
  }

  private createTrade = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const tradeData = request.body as TradeDto;
    try {
      if (tradeData.isBuy === 1 && currentUser.availableFunds < tradeData.amount) {
        response.status(400).send({ message: "You haven't enough amount to invest" });
      } else {
        const trade = await this._tradeService.createTrade(currentUser, tradeData);
        if (trade == null) {
          response.status(400).send({ message: "can't find this stock" });
        } else {
          response.send({ data:  trade, message: "Trade success"  });
        }
      }
    } catch (error) {
      next(error);
    }
  };

  private getInvestedSctors = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const userId =  request.params.id;
    try {
      const sectors = await this._tradeService.getInvestedSectors(userId);
      response.send({ data: sectors });
    } catch (error) {
      next(error);
    }
  };

  private getTop5Holdings = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const currentUser = request.user as User;
    const userId =  request.params.id;
    try {
      const sectors = await this._tradeService.getTop5Holdings(userId);
      response.send({ data: sectors });
    } catch (error) {
      next(error);
    }
  };
}

export default TradeController;
