"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("_app/interfaces");
const middlewares_1 = require("_app/middlewares");
class CustomScenarioController extends interfaces_1.Controller {
    constructor(loggerFactory) {
        super("/customscenario", loggerFactory.getNamedLogger("customscenario-controller"));
        this.save = async (request, response, next) => {
            try {
                const currentUser = request.user;
                // const scenarioID = request.body.scenarioID;
                // const value = request.body.value;
                // const scenarioBy = request.body.scenarioBy;
                const scenarioValue = await this._customScenarioService
                    .addValue(currentUser._id.toString(), JSON.stringify(request.body));
                console.log(request.body);
                // const myId = currentUser._id.toString();
                // const data = await this._newsService.getIpos(myId);
                response.status(200).send({ message: "success", data: scenarioValue });
            }
            catch (error) {
                next(error);
            }
        };
        this.getAll = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const myId = currentUser._id.toString();
                const data = await this._customScenarioService.getAllCustomScenarios();
                response.status(200).send({ message: "success", data: data });
            }
            catch (error) {
                next(error);
            }
        };
        this.matchStock = async (request, response, next) => {
            try {
                const stockID = request.body.stockID.toString();
                const data = await this._customScenarioService.matchStock(stockID);
                response.status(200).send({ message: "success", data: data });
            }
            catch (error) {
                next(error);
            }
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/save`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.save);
        this.router.get(`${this.path}/`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getAll);
        this.router.get(`${this.path}/matchStock`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.matchStock);
    }
}
exports.default = CustomScenarioController;
//# sourceMappingURL=customScenario.controller.js.map