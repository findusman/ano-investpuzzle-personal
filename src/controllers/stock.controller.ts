import { Request, Response, NextFunction } from "express";
import { NotFoundException } from "_app/exceptions";
import { Controller, RequestWithUser, User } from "_app/interfaces";
import { authMiddleware, validationMiddlewareArray, queryIdValidator, queryMiddleware, validationMiddleware } from "_app/middlewares";
import { FollowstockDto, StockCommentDto, StockCommentLikeDto, StockSearchTypeDto } from "_app/dtos";
import { LoggerFactory } from "_app/factories";
import { isObjectIdOrHexString } from "mongoose";
import { getPaginator } from "_app/utils";




class StockController extends Controller {
  constructor(loggerFactory: LoggerFactory) {
    super("/stocks", loggerFactory.getNamedLogger("stock-controller"));
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/:id/follow`,
      validationMiddleware(FollowstockDto),
      authMiddleware({ skipAuthorization: false }),
      this.followStock
    );

    this.router.post(
      `${this.path}/:id/comment`,
      validationMiddleware(StockCommentDto),
      authMiddleware({ skipAuthorization: false }),
      this.commentStock
    );

    this.router.put(
      `${this.path}/comment/:id`,
      authMiddleware(),
      validationMiddleware(StockCommentDto),
      this.updateComment
    );

    this.router.delete(`${this.path}/comment/:id`, authMiddleware(), this.deleteComment);

    this.router.post(
      `${this.path}/:id/commentlike`,
      validationMiddleware(StockCommentLikeDto),
      authMiddleware({ skipAuthorization: false }),
      this.stockCommentLike
    );

    this.router.get(`${this.path}/topwinners`, authMiddleware({ skipAuthorization: false }), this.getTopWinners);
    this.router.get(`${this.path}/toplosers`, authMiddleware({ skipAuthorization: false }), this.getTopLosers);
    this.router.get(`${this.path}/:id/comments`, authMiddleware({ skipAuthorization: false }), this.getStockComments);

    this.router.get(
      `${this.path}/`,
      queryMiddleware(StockSearchTypeDto),
      authMiddleware({ skipAuthorization: false }),
      this.getStocks
    );
    this.router.get(`${this.path}/:id`, authMiddleware({ skipAuthorization: false }), this.getStock);



    this.router.get(`${this.path}/:id/graph`, authMiddleware({ skipAuthorization: false }), this.getStockGraphData);
    this.router.get(`${this.path}/:id/graphperrange/:range`, authMiddleware({ skipAuthorization: false }), this.getStockGraphDataPerRange);
    this.router.get(`${this.path}/:id/customscenariographperrange/:range`, authMiddleware({ skipAuthorization: false }), this.getCustomScenarioStockGraphDataPerRange);
    this.router.get(`${this.path}/:id/stockdetail/:method`, authMiddleware({ skipAuthorization: false }), this.getStockDetail);
    this.router.get(`${this.path}/:sector/marketperformance`, authMiddleware({ skipAuthorization: false }), this.getSectorMarketPerformance);

  }

  private followStock = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      console.log(request.body);

      const { follow } = request.body as FollowstockDto;
      const stockId = request.params.id;
      const stock: any = await (isObjectIdOrHexString(stockId)
        ? this._stockService.getStockById(stockId)
        : this._stockService.getStocklistByTicker(stockId));
      if (stock) {
        await this._stockService.followStock(follow, stock._id, currentUser._id);
        response.status(200).send({ message: "successfully saved" });
      } else {
        next(new NotFoundException("Stock"));
      }
    } catch (error) {
      next(error);
    }
  };



  private commentStock = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const stockId = request.params.id;
      const currentUser = request.user as User;
      const { content } = request.body as StockCommentDto;
      await this._stockService.createComment(currentUser, stockId, content);
      response.status(200).send({ message: "successfully saved" });
    } catch (error) {
      next(error);
    }
  };

  private updateComment = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const commentId = request.params.id;
      const { content } = request.body as StockCommentDto;
      await this._stockService.updateComment(currentUser, commentId, content);
      response.status(200).send({ message: "successfully updated" });
    } catch (error) {
      next(error);
    }
  };

  private deleteComment = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const commentId = request.params.id;
      await this._stockService.removeComment(currentUser, commentId);
      response.status(200).send({ message: "successfully updated" });
    } catch (error) {
      next(error);
    }
  };

  private stockCommentLike = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const commentId = request.params.id;
      const { isLike } = request.body as StockCommentLikeDto;
      await this._stockService.setStockCommentLike(currentUser, commentId, isLike);
      response.status(200).send({ message: "successfully updated" });
    } catch (error) {
      next(error);
    }
  };

  private getStockComments = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const stockId = request.params.id;
      const { page, skip, limit } = getPaginator(request);
      const data = await this._stockService.getStockComments(currentUser, stockId, limit, page, skip);
      response.send(data);
    } catch (error) {
      next(error);
    }
  };

  private getStocks = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const { page, skip, limit, keyword, filterType, myfollowonly, orderBy } = getPaginator(request);
      const data = await this._stockService.getStocks(
        currentUser._id,
        limit,
        page,
        skip,
        keyword,
        filterType,
        myfollowonly,
        orderBy.toString()
      );
      response.send(data);
    } catch (error) {
      next(error);
    }
  };

  private getStock = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const stockId = request.params.id;
      const stock = await (isObjectIdOrHexString(stockId)
        ? this._stockService.getStockById(stockId, currentUser._id)
        : this._stockService.getStocklistByTicker(stockId, currentUser._id));
      if (stock) {
        let stockCurrencyExchange = await this._fmpService.getStockCurrencyExchangeRate(stock.currency ?? "USD");
        stock.currencyRate = stockCurrencyExchange;
        response.send({ data: stock });
      } else {
        next(new NotFoundException("Stock"));
      }
    } catch (error) {
      next(error);
    }
  };


  private getStockGraphData = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const stockId = request.params.id;
      const stock = await (isObjectIdOrHexString(stockId)
        ? this._stockService.getStockById(stockId)
        : this._stockService.getStocklistByTicker(stockId));
      if (stock) {
        const data = await this._stockService.getGraphData(stock.symbol, stockId);
        response.send({ data });
      } else {
        next(new NotFoundException("Stock"));
      }
    } catch (error) {
      next(error);
    }
  };
  private getStockGraphDataPerRange = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const stockId = request.params.id;
      const range = request.params.range; // 1D, 1W, 1M, 1Y, All
      const stock = await (isObjectIdOrHexString(stockId)
        ? this._stockService.getStockById(stockId)
        : this._stockService.getStocklistByTicker(stockId));
      if (stock) {
        const data = await this._stockService.getGraphDataPerRange(stock.symbol, stockId, range);
        response.send({ data });
      } else {
        next(new NotFoundException("Stock"));
      }
    } catch (error) {
      next(error);
    }
  };


  private getCustomScenarioStockGraphDataPerRange = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const stockId = request.params.id;
      const range = request.params.range; // 1D, 1W, 1M, 1Y, All
      const stock = await (isObjectIdOrHexString(stockId)
        ? this._stockService.getStockById(stockId)
        : this._stockService.getStocklistByTicker(stockId));
      if (stock) {
        const data = await this._stockService.getGraphDataPerRange(stock.symbol, stockId, range);
        const breakDownValue: number = await this._customScenarioService.matchStock(stock._id);

        if (breakDownValue != 0) {
          await data.graphdata.forEach(function (value: any) {
            value.close = parseFloat((value.close * breakDownValue).toFixed(2))
          });
        }




        response.send({ data });
      } else {
        next(new NotFoundException("Stock"));
      }
    } catch (error) {
      next(error);
    }
  };

  private getTopWinners = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const data = await this._stockService.getTopWinners();
      response.send(data);
    } catch (error) {
      next(error);
    }
  };
  private getTopLosers = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const data = await this._stockService.getTopLosers();
      response.send(data);
    } catch (error) {
      next(error);
    }
  };

  private getStockDetail = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const stockId = request.params.id;
      const method = request.params.method;
      const stock = await (isObjectIdOrHexString(stockId)
        ? this._stockService.getStockById(stockId)
        : this._stockService.getStocklistByTicker(stockId));
      if (stock) {
        if (method == "SectorPeRatio" || method == "IndustryPeRatio") {
          const data1 = await this._stockService.getRatios(stock.symbol, method, stock.sector, stock.industry);
          response.send({ data: data1 });
        } else {
          const data1 = await this._stockService.getStockDetail(stock.symbol, method, stock.sector, stock.industry);
          response.send({ data: data1 });
        }
      } else {
        next(new NotFoundException("Stock"));
      }
    } catch (error) {
      next(error);
    }
  };

  private getSectorMarketPerformance = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const sector = request.params.sector;
      const data1 = await this._stockService.getSectorMarketPerformance(sector);
      response.send({ data: data1 });
    } catch (error) {
      next(error);
    }
  };
}

export default StockController;
