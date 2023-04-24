"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("_app/interfaces");
const middlewares_1 = require("_app/middlewares");
const utils_1 = require("_app/utils");
const exceptions_1 = require("_app/exceptions");
const dtos_1 = require("_app/dtos");
const mongoose_1 = require("mongoose");
class UserController extends interfaces_1.Controller {
    constructor(loggerFactory) {
        super("/users", loggerFactory.getNamedLogger("user-controller"));
        this.getUser = async (request, response, next) => {
            const currentUser = request.user;
            if (currentUser) {
                response.send({ data: { user: currentUser } });
            }
            else {
                next(new exceptions_1.NotFoundException("User"));
            }
        };
        this.updateProfile = async (request, response, next) => {
            const currentUser = request.user;
            const profileData = request.body;
            try {
                const user = await this._userService.updateProfile(currentUser._id, currentUser.passwordHash, profileData);
                response.send({ data: { user } });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteUser = async (request, response, next) => {
            const currentUser = request.user;
            await this._userService.deleteUser(currentUser._id);
            response.status(204).send();
        };
        this.followUser = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const { follow } = request.body;
                const id = request.params.id;
                const user = await ((0, mongoose_1.isObjectIdOrHexString)(id)
                    ? this._userService.getUserById(id)
                    : this._userService.getUserByUsername(id));
                if (user) {
                    await this._userService.followUser(follow, user._id, currentUser._id, currentUser.userFullName);
                    response.status(200).send({ message: "successfully saved" });
                }
                else {
                    next(new exceptions_1.NotFoundException("User"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.removeFollowingUser = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const id = request.params.id;
                const user = await ((0, mongoose_1.isObjectIdOrHexString)(id)
                    ? this._userService.getUserById(id)
                    : this._userService.getUserByUsername(id));
                if (user) {
                    await this._userService.blockFollowUser(currentUser._id, user._id, currentUser.userFullName);
                    response.status(200).send({ message: "successfully blocked" });
                }
                else {
                    next(new exceptions_1.NotFoundException("User"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.acceptFollowUser = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const { follow } = request.body;
                const id = request.params.id;
                const user = await ((0, mongoose_1.isObjectIdOrHexString)(id)
                    ? this._userService.getUserById(id)
                    : this._userService.getUserByUsername(id));
                if (user) {
                    await this._userService.acceptFollowuser(follow, currentUser._id, user._id);
                    response.status(200).send({ message: "successfully saved" });
                }
                else {
                    next(new exceptions_1.NotFoundException("User"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserFollowers = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const checkingUserId = request.params.id;
                //const checkingUser = await this._userService.getUserById(checkingUserId);
                const { page, skip, limit, keyword, filterType, myfollowonly, orderBy } = (0, utils_1.getPaginator)(request);
                const data = await this._userService.getFollowers(currentUser._id, checkingUserId, limit, page, skip, keyword, orderBy.toString());
                response.send({ data: data });
            }
            catch (error) {
                next(error);
            }
        };
        this.filterUsers = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const { page, skip, limit, keyword, filterType, myfollowonly, orderBy } = (0, utils_1.getPaginator)(request);
                const data = await this._userService.getUsers(currentUser._id, limit, page, skip, keyword, orderBy.toString());
                response.send(data);
            }
            catch (error) {
                next(error);
            }
        };
        this.getStudents = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const { studentStatus } = request.body;
                const id = request.params.id;
                const user = await ((0, mongoose_1.isObjectIdOrHexString)(id)
                    ? this._userService.getUserById(id)
                    : this._userService.getUserByUsername(id));
                if (user) {
                    const students = await this._userService.getAllUsersOfProfessor(user._id, studentStatus);
                    response.status(200).send({ students });
                }
                else {
                    next(new exceptions_1.NotFoundException("User"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.updateStudentStatus = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const { studentStatus } = request.body;
                const id = request.params.id;
                const user = await ((0, mongoose_1.isObjectIdOrHexString)(id)
                    ? this._userService.getUserById(id)
                    : this._userService.getUserByUsername(id));
                if (user) {
                    //if (user.professor === currentUser._id.toString()) {
                    await this._userService.updateUserStatus(user, studentStatus == 0 ? false : true);
                    response.status(200).send({ "message": "success" });
                    // } else {
                    //   next(new NotFoundException("User"));
                    // }
                }
                else {
                    next(new exceptions_1.NotFoundException("User"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserFollowings = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const checkingUserId = request.params.id;
                const { page, skip, limit, keyword, filterType, myfollowonly, orderBy } = (0, utils_1.getPaginator)(request);
                const data = await this._userService.getFollowings(currentUser._id, checkingUserId, limit, page, skip, keyword, orderBy.toString());
                response.send({ data: data });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserProfile = async (request, response, next) => {
            var _a;
            try {
                const id = request.params.id;
                console.log(id);
                const user = await ((0, mongoose_1.isObjectIdOrHexString)(id)
                    ? this._userService.getUserById(id, (_a = request.user) === null || _a === void 0 ? void 0 : _a._id)
                    : this._userService.getUserByUsername(id));
                if (user) {
                    const totalHolding = await this._userService.getuserTotalHolding(id);
                    const inceptionStock = await this._userService.getInceptionDate(id);
                    response.send({ data: { user: user, totalHolding: totalHolding, inceptionStock: inceptionStock } });
                }
                else {
                    next(new exceptions_1.NotFoundException("User"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserGroups = async (request, response, next) => {
            var _a;
            try {
                const userId = request.params.id;
                const user = await ((0, mongoose_1.isObjectIdOrHexString)(userId)
                    ? this._userService.getUserById(userId, (_a = request.user) === null || _a === void 0 ? void 0 : _a._id)
                    : this._userService.getUserByUsername(userId));
                if (user) {
                    const groups = await this._groupService.getUserGroups(user);
                    response.send({ data: { groups } });
                }
                else {
                    next(new exceptions_1.NotFoundException("User"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getFollowings = async (request, response, next) => {
            var _a;
            try {
                const userId = request.params.id;
                const user = await ((0, mongoose_1.isObjectIdOrHexString)(userId)
                    ? this._userService.getUserById(userId, (_a = request.user) === null || _a === void 0 ? void 0 : _a._id)
                    : this._userService.getUserByUsername(userId));
                if (user) {
                    const stocks = await this._stockService.getFollowedStocks(user);
                    const users = await this._userService.getFollowedUsers(user);
                    const all = [...stocks, ...users].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
                    response.send({ all, stocks, users });
                }
                else {
                    next(new exceptions_1.NotFoundException("User"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getHoldings = async (request, response, next) => {
            var _a;
            try {
                const userId = request.params.id;
                const user = await ((0, mongoose_1.isObjectIdOrHexString)(userId)
                    ? this._userService.getUserById(userId, (_a = request.user) === null || _a === void 0 ? void 0 : _a._id)
                    : this._userService.getUserByUsername(userId));
                if (user) {
                    const { cashPercent, holdings } = await this._stockService.getHoldings(user);
                    response.send({ cashPercent, holdings });
                }
                else {
                    next(new exceptions_1.NotFoundException("User"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getReturn = async (request, response, next) => {
            var _a;
            try {
                const userId = request.params.id;
                const user = await ((0, mongoose_1.isObjectIdOrHexString)(userId)
                    ? this._userService.getUserById(userId, (_a = request.user) === null || _a === void 0 ? void 0 : _a._id)
                    : this._userService.getUserByUsername(userId));
                if (user) {
                    const returns = await this._stockService.getReturn(user, 2);
                    response.send({ returns });
                }
                else {
                    next(new exceptions_1.NotFoundException("User"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getReturnGraphData = async (request, response, next) => {
            var _a;
            try {
                const userId = request.params.id;
                const user = await ((0, mongoose_1.isObjectIdOrHexString)(userId)
                    ? this._userService.getUserById(userId, (_a = request.user) === null || _a === void 0 ? void 0 : _a._id)
                    : this._userService.getUserByUsername(userId));
                if (user) {
                    const { returnData, returns } = await this._returnService.getReturnGraphData(user);
                    response.send({ returnData, returns });
                }
                else {
                    next(new exceptions_1.NotFoundException("User"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getRanking = async (request, response, next) => {
            var _a;
            try {
                const userId = request.params.id;
                const user = await ((0, mongoose_1.isObjectIdOrHexString)(userId)
                    ? this._userService.getUserById(userId, (_a = request.user) === null || _a === void 0 ? void 0 : _a._id)
                    : this._userService.getUserByUsername(userId));
                if (user) {
                    const ranking = await this._stockService.getRanking(user);
                    response.send({ ranking });
                }
                else {
                    next(new exceptions_1.NotFoundException("User"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.userBadges = async (request, response, next) => {
            const currentUser = request.user;
            const userId = request.params.id;
            try {
                const badges = await this._badgeService.getUserBadges(userId);
                response.send({ message: "success", data: { badges } });
            }
            catch (error) {
                next(error);
            }
        };
        this.userGeographicalBreakdown = async (request, response, next) => {
            const currentUser = request.user;
            const userId = request.params.id;
            try {
                const data = await this._userService.getUserGeographicalBreakdown(userId);
                response.send({ message: "success", data });
            }
            catch (error) {
                next(error);
            }
        };
        this.userPortfolioAnalysis = async (request, response, next) => {
            const currentUser = request.user;
            const userId = request.params.id;
            try {
                const data = await this._userService.getUserPortfolioAnalysis(userId);
                response.send({ message: "success", data });
            }
            catch (error) {
                next(error);
            }
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}/me`, (0, middlewares_1.authMiddleware)(), this.getUser);
        this.router.put(`${this.path}/`, (0, middlewares_1.authMiddleware)(), (0, middlewares_1.validationMiddleware)(dtos_1.UpdateProfileDto), this.updateProfile);
        this.router.delete(`${this.path}/`, (0, middlewares_1.authMiddleware)(), this.deleteUser);
        this.router.get(`${this.path}/:id`, (0, middlewares_1.authMiddleware)(), this.getUserProfile);
        this.router.post(`${this.path}/:id/follow`, (0, middlewares_1.validationMiddleware)(dtos_1.UserFollowDto), (0, middlewares_1.authMiddleware)(), this.followUser);
        this.router.post(`${this.path}/:id/students`, (0, middlewares_1.validationMiddleware)(dtos_1.GetStudentsDto), (0, middlewares_1.authMiddleware)(), this.getStudents);
        this.router.post(`${this.path}/:id/updatestatus`, (0, middlewares_1.validationMiddleware)(dtos_1.GetStudentsDto), (0, middlewares_1.authMiddleware)(), this.updateStudentStatus);
        this.router.get(`${this.path}/:id/blockfollow`, (0, middlewares_1.authMiddleware)(), this.removeFollowingUser);
        this.router.post(`${this.path}/:id/acceptfollow`, (0, middlewares_1.validationMiddleware)(dtos_1.UserFollowDto), (0, middlewares_1.authMiddleware)(), this.acceptFollowUser);
        this.router.get(`${this.path}/:id/followers`, (0, middlewares_1.authMiddleware)(), this.getUserFollowers);
        // this.router.get(`${this.path}/:id/followings`, authMiddleware(), this.getUserFollowings);
        this.router.get(`${this.path}/:id/groups`, (0, middlewares_1.authMiddleware)(), this.getUserGroups);
        this.router.get(`${this.path}/:id/followings`, (0, middlewares_1.authMiddleware)(), this.getFollowings);
        this.router.get(`${this.path}/:id/holdings`, (0, middlewares_1.authMiddleware)(), this.getHoldings);
        this.router.get(`${this.path}/:id/return`, (0, middlewares_1.authMiddleware)(), this.getReturn);
        this.router.get(`${this.path}/:id/return/graph`, (0, middlewares_1.authMiddleware)(), this.getReturnGraphData);
        this.router.get(`${this.path}/:id/ranking`, (0, middlewares_1.authMiddleware)(), this.getRanking);
        this.router.get(`${this.path}/:id/badges`, (0, middlewares_1.authMiddleware)(), this.userBadges);
        this.router.get(`${this.path}/:id/portfolioanalysis`, (0, middlewares_1.authMiddleware)(), this.userPortfolioAnalysis);
        this.router.get(`${this.path}/:id/geographicalbreakdown`, (0, middlewares_1.authMiddleware)(), this.userGeographicalBreakdown);
        this.router.get(`${this.path}/`, (0, middlewares_1.authMiddleware)(), this.filterUsers);
    }
}
exports.default = UserController;
//# sourceMappingURL=user.controller.js.map