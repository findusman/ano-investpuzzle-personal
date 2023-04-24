"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exceptions_1 = require("_app/exceptions");
const interfaces_1 = require("_app/interfaces");
const middlewares_1 = require("_app/middlewares");
const dtos_1 = require("_app/dtos");
const mongoose_1 = require("mongoose");
const utils_1 = require("_app/utils");
class StockController extends interfaces_1.Controller {
    constructor(loggerFactory) {
        super("/stocks", loggerFactory.getNamedLogger("stock-controller"));
        this.followStock = async (request, response, next) => {
            try {
                const currentUser = request.user;
                console.log(request.body);
                const { follow } = request.body;
                const stockId = request.params.id;
                const stock = await ((0, mongoose_1.isObjectIdOrHexString)(stockId)
                    ? this._stockService.getStockById(stockId)
                    : this._stockService.getStocklistByTicker(stockId));
                if (stock) {
                    await this._stockService.followStock(follow, stock._id, currentUser._id);
                    response.status(200).send({ message: "successfully saved" });
                }
                else {
                    next(new exceptions_1.NotFoundException("Stock"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.commentStock = async (request, response, next) => {
            try {
                const stockId = request.params.id;
                const currentUser = request.user;
                const { content } = request.body;
                await this._stockService.createComment(currentUser, stockId, content);
                response.status(200).send({ message: "successfully saved" });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateComment = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const commentId = request.params.id;
                const { content } = request.body;
                await this._stockService.updateComment(currentUser, commentId, content);
                response.status(200).send({ message: "successfully updated" });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteComment = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const commentId = request.params.id;
                await this._stockService.removeComment(currentUser, commentId);
                response.status(200).send({ message: "successfully updated" });
            }
            catch (error) {
                next(error);
            }
        };
        this.stockCommentLike = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const commentId = request.params.id;
                const { isLike } = request.body;
                await this._stockService.setStockCommentLike(currentUser, commentId, isLike);
                response.status(200).send({ message: "successfully updated" });
            }
            catch (error) {
                next(error);
            }
        };
        this.getStockComments = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const stockId = request.params.id;
                const { page, skip, limit } = (0, utils_1.getPaginator)(request);
                const data = await this._stockService.getStockComments(currentUser, stockId, limit, page, skip);
                response.send(data);
            }
            catch (error) {
                next(error);
            }
        };
        this.getStocks = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const { page, skip, limit, keyword, filterType, myfollowonly, orderBy } = (0, utils_1.getPaginator)(request);
                const data = await this._stockService.getStocks(currentUser._id, limit, page, skip, keyword, filterType, myfollowonly, orderBy.toString());
                response.send(data);
            }
            catch (error) {
                next(error);
            }
        };
        this.getStock = async (request, response, next) => {
            var _a;
            try {
                const currentUser = request.user;
                const stockId = request.params.id;
                const stock = await ((0, mongoose_1.isObjectIdOrHexString)(stockId)
                    ? this._stockService.getStockById(stockId, currentUser._id)
                    : this._stockService.getStocklistByTicker(stockId, currentUser._id));
                if (stock) {
                    let stockCurrencyExchange = await this._fmpService.getStockCurrencyExchangeRate((_a = stock.currency) !== null && _a !== void 0 ? _a : "USD");
                    stock.currencyRate = stockCurrencyExchange;
                    response.send({ data: stock });
                }
                else {
                    next(new exceptions_1.NotFoundException("Stock"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getStockGraphData = async (request, response, next) => {
            try {
                const stockId = request.params.id;
                const stock = await ((0, mongoose_1.isObjectIdOrHexString)(stockId)
                    ? this._stockService.getStockById(stockId)
                    : this._stockService.getStocklistByTicker(stockId));
                if (stock) {
                    const data = await this._stockService.getGraphData(stock.symbol, stockId);
                    response.send({ data });
                }
                else {
                    next(new exceptions_1.NotFoundException("Stock"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getStockGraphDataPerRange = async (request, response, next) => {
            try {
                const stockId = request.params.id;
                const range = request.params.range; // 1D, 1W, 1M, 1Y, All
                const stock = await ((0, mongoose_1.isObjectIdOrHexString)(stockId)
                    ? this._stockService.getStockById(stockId)
                    : this._stockService.getStocklistByTicker(stockId));
                if (stock) {
                    const data = await this._stockService.getGraphDataPerRange(stock.symbol, stockId, range);
                    response.send({ data });
                }
                else {
                    next(new exceptions_1.NotFoundException("Stock"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getCustomScenarioStockGraphDataPerRange = async (request, response, next) => {
            try {
                const stockId = request.params.id;
                const range = request.params.range; // 1D, 1W, 1M, 1Y, All
                const stock = await ((0, mongoose_1.isObjectIdOrHexString)(stockId)
                    ? this._stockService.getStockById(stockId)
                    : this._stockService.getStocklistByTicker(stockId));
                if (stock) {
                    const data = await this._stockService.getGraphDataPerRange(stock.symbol, stockId, range);
                    const breakDownValue = await this._customScenarioService.matchStock(stock._id);
                    if (breakDownValue != 0) {
                        await data.graphdata.forEach(function (value) {
                            value.close = parseFloat((value.close * breakDownValue).toFixed(2));
                        });
                    }
                    response.send({ data });
                }
                else {
                    next(new exceptions_1.NotFoundException("Stock"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getTopWinners = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const data = await this._stockService.getTopWinners();
                response.send(data);
            }
            catch (error) {
                next(error);
            }
        };
        this.getTopLosers = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const data = await this._stockService.getTopLosers();
                response.send(data);
            }
            catch (error) {
                next(error);
            }
        };
        this.getStockDetail = async (request, response, next) => {
            try {
                const stockId = request.params.id;
                const method = request.params.method;
                const stock = await ((0, mongoose_1.isObjectIdOrHexString)(stockId)
                    ? this._stockService.getStockById(stockId)
                    : this._stockService.getStocklistByTicker(stockId));
                if (stock) {
                    if (method == "SectorPeRatio" || method == "IndustryPeRatio") {
                        const data1 = await this._stockService.getRatios(stock.symbol, method, stock.sector, stock.industry);
                        response.send({ data: data1 });
                    }
                    else {
                        const data1 = await this._stockService.getStockDetail(stock.symbol, method, stock.sector, stock.industry);
                        response.send({ data: data1 });
                    }
                }
                else {
                    next(new exceptions_1.NotFoundException("Stock"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getSectorMarketPerformance = async (request, response, next) => {
            try {
                const sector = request.params.sector;
                const data1 = await this._stockService.getSectorMarketPerformance(sector);
                response.send({ data: data1 });
            }
            catch (error) {
                next(error);
            }
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/:id/follow`, (0, middlewares_1.validationMiddleware)(dtos_1.FollowstockDto), (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.followStock);
        this.router.post(`${this.path}/:id/comment`, (0, middlewares_1.validationMiddleware)(dtos_1.StockCommentDto), (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.commentStock);
        this.router.put(`${this.path}/comment/:id`, (0, middlewares_1.authMiddleware)(), (0, middlewares_1.validationMiddleware)(dtos_1.StockCommentDto), this.updateComment);
        this.router.delete(`${this.path}/comment/:id`, (0, middlewares_1.authMiddleware)(), this.deleteComment);
        this.router.post(`${this.path}/:id/commentlike`, (0, middlewares_1.validationMiddleware)(dtos_1.StockCommentLikeDto), (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.stockCommentLike);
        this.router.get(`${this.path}/topwinners`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getTopWinners);
        this.router.get(`${this.path}/toplosers`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getTopLosers);
        this.router.get(`${this.path}/:id/comments`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getStockComments);
        this.router.get(`${this.path}/`, (0, middlewares_1.queryMiddleware)(dtos_1.StockSearchTypeDto), (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getStocks);
        this.router.get(`${this.path}/:id`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getStock);
        this.router.get(`${this.path}/:id/graph`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getStockGraphData);
        this.router.get(`${this.path}/:id/graphperrange/:range`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getStockGraphDataPerRange);
        this.router.get(`${this.path}/:id/customscenariographperrange/:range`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getCustomScenarioStockGraphDataPerRange);
        this.router.get(`${this.path}/:id/stockdetail/:method`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getStockDetail);
        this.router.get(`${this.path}/:sector/marketperformance`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getSectorMarketPerformance);
    }
}
exports.default = StockController;
//# sourceMappingURL=stock.controller.js.map