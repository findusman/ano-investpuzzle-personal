"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("_app/interfaces");
const middlewares_1 = require("_app/middlewares");
const utils_1 = require("_app/utils");
const dtos_1 = require("_app/dtos");
class NotificationController extends interfaces_1.Controller {
    constructor(loggerFactory) {
        super("/notifications", loggerFactory.getNamedLogger("group-controller"));
        this.deleteNotification = async (request, response, next) => {
            const currentUser = request.user;
            const notiId = request.params.id;
            try {
                await this._notificationService.removeNotification(currentUser._id, notiId);
                response.send({ data: { message: "Notification Item has been removed successfully" } });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateNotificationStatus = async (request, response, next) => {
            const currentUser = request.user;
            const notiIds = request.body;
            try {
                await this._notificationService.updateNotiReadStatus(currentUser._id, notiIds.notiIds);
                response.send({ data: { message: "Notifications status has been update successfully" } });
            }
            catch (error) {
                next(error);
            }
        };
        this.getNotifications = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const { page, limit, skip, pageToken, keyword, filterType, myfollowonly, orderBy } = (0, utils_1.getPaginator)(request);
                const data = await this._notificationService.getMyNotifications(currentUser._id, limit, page, skip, keyword, filterType, orderBy.toString());
                response.send({ data: data });
            }
            catch (error) {
                next(error);
            }
        };
        this.sendTestNoti = async (request, response, next) => {
            try {
                const { token } = request.body;
                const title = "Hello World";
                const content = "AADSFSDFSDF";
                await this._notificationService.sendPushNotification(token, title, content, "1");
                response.send({ data: { message: "Notifications status has been update successfully" } });
            }
            catch (error) {
                next(error);
            }
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, (0, middlewares_1.authMiddleware)(), this.getNotifications);
        this.router.put(`${this.path}/`, (0, middlewares_1.authMiddleware)(), (0, middlewares_1.validationMiddleware)(dtos_1.ReadNotificationDto), this.updateNotificationStatus);
        this.router.delete(`${this.path}/:id`, (0, middlewares_1.authMiddleware)(), this.deleteNotification);
        this.router.post(`${this.path}/sendtestnotification`, (0, middlewares_1.validationMiddleware)(dtos_1.TestNotiDto), this.sendTestNoti);
    }
}
exports.default = NotificationController;
//# sourceMappingURL=notification.controller.js.map