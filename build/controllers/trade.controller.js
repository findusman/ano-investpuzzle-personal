"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("_app/interfaces");
const middlewares_1 = require("_app/middlewares");
const dtos_1 = require("_app/dtos");
class TradeController extends interfaces_1.Controller {
    constructor(loggerFactory) {
        super("/trades", loggerFactory.getNamedLogger("trade-controller"));
        this.createTrade = async (request, response, next) => {
            const currentUser = request.user;
            const tradeData = request.body;
            try {
                if (tradeData.isBuy === 1 && currentUser.availableFunds < tradeData.amount) {
                    response.status(400).send({ message: "You haven't enough amount to invest" });
                }
                else {
                    const trade = await this._tradeService.createTrade(currentUser, tradeData);
                    if (trade == null) {
                        response.status(400).send({ message: "can't find this stock" });
                    }
                    else {
                        response.send({ data: trade, message: "Trade success" });
                    }
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getInvestedSctors = async (request, response, next) => {
            const currentUser = request.user;
            const userId = request.params.id;
            try {
                const sectors = await this._tradeService.getInvestedSectors(userId);
                response.send({ data: sectors });
            }
            catch (error) {
                next(error);
            }
        };
        this.getTop5Holdings = async (request, response, next) => {
            const currentUser = request.user;
            const userId = request.params.id;
            try {
                const sectors = await this._tradeService.getTop5Holdings(userId);
                response.send({ data: sectors });
            }
            catch (error) {
                next(error);
            }
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/`, (0, middlewares_1.authMiddleware)(), (0, middlewares_1.validationMiddleware)(dtos_1.TradeDto), this.createTrade);
        this.router.get(`${this.path}/:id/getInvestedSectors`, (0, middlewares_1.authMiddleware)(), this.getInvestedSctors);
        this.router.get(`${this.path}/:id/getTop5Holdings`, (0, middlewares_1.authMiddleware)(), this.getTop5Holdings);
    }
}
exports.default = TradeController;
//# sourceMappingURL=trade.controller.js.map