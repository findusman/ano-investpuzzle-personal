"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("_app/interfaces");
const middlewares_1 = require("_app/middlewares");
const utils_1 = require("_app/utils");
class NewsController extends interfaces_1.Controller {
    constructor(loggerFactory) {
        super("/news", loggerFactory.getNamedLogger("chat-controller"));
        this.getIpo = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const myId = currentUser._id.toString();
                const data = await this._newsService.getIpos(myId);
                response.status(200).send({ message: "success", data: data });
            }
            catch (error) {
                next(error);
            }
        };
        this.getMarketNews = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const { page, skip, limit } = (0, utils_1.getPaginator)(request);
                const data = await this._newsService.getMarketNews(limit, page, skip);
                response.send({ data: data });
            }
            catch (error) {
                next(error);
            }
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}/ipo`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getIpo);
        this.router.get(`${this.path}/marketnews`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getMarketNews);
    }
}
exports.default = NewsController;
//# sourceMappingURL=news.controller.js.map