"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("_app/interfaces");
const middlewares_1 = require("_app/middlewares");
const dtos_1 = require("_app/dtos");
const utils_1 = require("_app/utils");
class CommonController extends interfaces_1.Controller {
    constructor(loggerFactory) {
        super("/common", loggerFactory.getNamedLogger("auth-controller"));
        this.verifyOtp = async (request, response, next) => {
            const { code, type } = request.body;
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
                            }
                            else {
                                if (userData.endOfSubscriptionDate < new Date()) { // if subscription date is passed
                                    status = 3; // subscription expired
                                }
                                else {
                                    status = 0;
                                }
                            }
                            response.send({ data: { user: userData, status: status } });
                        }
                        else {
                            response.send({ message: "Email verification code has been confirmed" });
                        }
                    }
                    else {
                        response.send({ message: "Email verification code has been confirmed" });
                    }
                }
                catch (error) {
                    response.status(400).send({ message: "Wrong code" });
                }
            }
            else {
                response.status(400).send({ message: "Othertype code" });
            }
        };
        this.verifyCurrentPassword = async (request, response, next) => {
            const { currentPassword } = request.body;
            const currentUser = request.user;
            try {
                await this._userService.confirmCurrentPassword(currentUser, currentPassword);
                response.send({ message: "Current password is correct" });
            }
            catch (error) {
                next(error);
            }
        };
        this.saveToken = async (request, response, next) => {
            const { token } = request.body;
            const currentUser = request.user;
            try {
                await this._userService.saveToken(currentUser, token);
                response.send({ message: "Update token success" });
            }
            catch (error) {
                next(error);
            }
        };
        this.getProunsEducationCountries = async (request, response, next) => {
            try {
                const data = await this._accessoriesService.getProunsEducationCountries();
                response.send({ message: "success", data });
            }
            catch (error) {
                next(error);
            }
        };
        this.saveFavMultiStocks = async (request, response, next) => {
            try {
                const { stockIds } = request.body;
                const currentUser = request.user;
                const data = await this._stockService.saveFavMultiStocks(currentUser, stockIds);
                response.send({ message: "success" });
            }
            catch (error) {
                next(error);
            }
        };
        this.registerBadge = async (request, response, next) => {
            try {
                const userId = request.params.id;
                const badgeId = "63831fc14048f518d9eb11a5"; // "63831fc14048f518d9eb11a3";
                const receivedBadgeObj = await this._badgeService.registerReceivedBadge(badgeId, userId);
                response.send({ message: "badge saved successfully", receivedBadge: receivedBadgeObj });
            }
            catch (error) {
                next(error);
            }
        };
        this.getAllBadges = async (request, response, next) => {
            try {
                const data = await this._badgeService.getAllBadges();
                response.send({ message: "success", data });
            }
            catch (error) {
                console.log(error);
                response.status(400).send({ message: "Wrong code" });
            }
        };
        this.getRecomenedStocks = async (request, response, next) => {
            try {
                const data = await this._stockService.getRecomenedStocks();
                response.send({ message: "success", data });
            }
            catch (error) {
                console.log(error);
                response.status(400).send({ message: "Wrong request" });
            }
        };
        this.getRankings = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const { page, skip, limit, keyword } = (0, utils_1.getPaginator)(request);
                const data = await this._stockService.getRankings(currentUser._id, currentUser.professor, limit, page, skip, keyword);
                response.send({ data });
            }
            catch (error) {
                next(error);
            }
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}/getaccessories`, this.getProunsEducationCountries);
        this.router.post(`${this.path}/confirmOtp`, (0, middlewares_1.validationMiddleware)(dtos_1.EmailVerifyTokenDto), (0, middlewares_1.registerAuthMiddleware)({ skipAuthorization: false }), this.verifyOtp);
        this.router.post(`${this.path}/confirmcurrentpassword`, (0, middlewares_1.validationMiddleware)(dtos_1.ConfirmCurrentPasswordDto), (0, middlewares_1.authMiddleware)(), this.verifyCurrentPassword);
        this.router.get(`${this.path}/getallbadges`, this.getAllBadges);
        this.router.get(`${this.path}/getrankings`, (0, middlewares_1.authMiddleware)(), this.getRankings);
        this.router.post(`${this.path}/savetoken`, (0, middlewares_1.validationMiddleware)(dtos_1.SaveFcmTokenDto), (0, middlewares_1.authMiddleware)(), this.saveToken);
        this.router.get(`${this.path}/recommendedstocks`, (0, middlewares_1.authMiddleware)(), this.getRecomenedStocks);
        this.router.post(`${this.path}/favoritemultistocks`, (0, middlewares_1.validationMiddleware)(dtos_1.FollowMultiStockDto), (0, middlewares_1.authMiddleware)(), this.saveFavMultiStocks);
        this.router.get(`${this.path}/:id/registerbadge`, (0, middlewares_1.authMiddleware)(), this.registerBadge);
    }
}
exports.default = CommonController;
//# sourceMappingURL=common.controller.js.map