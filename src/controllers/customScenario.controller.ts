import { Request, Response, NextFunction } from "express";
import { NotFoundException } from "_app/exceptions";
import { customScenario, customScenarioValue, Controller, RequestWithUser, User } from "_app/interfaces";
import { authMiddleware, queryIdValidator, queryMiddleware, validationMiddleware } from "_app/middlewares";
import { ChatMessageDto, FollowMultiStockDto, GetRoomDataDto } from "_app/dtos";
import { LoggerFactory } from "_app/factories";
import { isObjectIdOrHexString } from "mongoose";
import { getPaginator } from "_app/utils";

class CustomScenarioController extends Controller {
  constructor(loggerFactory: LoggerFactory) {
    super("/customscenario", loggerFactory.getNamedLogger("customscenario-controller"));
    this.initializeRoutes();
  }

  private initializeRoutes() {

    this.router.post(`${this.path}/save`, authMiddleware({ skipAuthorization: false }), this.save);
    this.router.get(`${this.path}/`, authMiddleware({ skipAuthorization: false }), this.getAll);
    this.router.get(`${this.path}/matchStock`, authMiddleware({ skipAuthorization: false }), this.matchStock);
  }

  private save = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      // const scenarioID = request.body.scenarioID;
      // const value = request.body.value;
      // const scenarioBy = request.body.scenarioBy;


      const scenarioValue = await this._customScenarioService
        .addValue(
          currentUser._id.toString(),
          JSON.stringify(request.body)
        );



      console.log(request.body);
      // const myId = currentUser._id.toString();
      // const data = await this._newsService.getIpos(myId);
      response.status(200).send({ message: "success", data: scenarioValue });

    } catch (error) {
      next(error);
    }
  };

  private getAll = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const myId = currentUser._id.toString();

      const data = await this._customScenarioService.getAllCustomScenarios();
      response.status(200).send({ message: "success", data: data });

    } catch (error) {
      next(error);
    }
  };

  private matchStock = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {

      const stockID = request.body.stockID.toString();


      const data = await this._customScenarioService.matchStock(stockID);
      response.status(200).send({ message: "success", data: data });

    } catch (error) {
      next(error);
    }
  };


}

export default CustomScenarioController;
