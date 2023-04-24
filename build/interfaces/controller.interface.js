"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const express_1 = require("express");
const services_1 = require("_app/services");
const accessories_service_1 = require("_app/services/accessories.service");
const chat_service_1 = require("_app/services/chat.service");
const group_service_1 = require("_app/services/group.service");
const post_service_1 = require("_app/services/post.service");
/**
 * Base controller that handles abstracted logic common to all controllers in the application
 */
class Controller {
    /**
     * The controller constructor is responsible for setting up the router and initialising the routes to the the
     * implementing controller
     * @constructor
     */
    constructor(path, logger) {
        this.logger = logger;
        this.router = (0, express_1.Router)();
        this.path = path;
        this._authenticationService = services_1.AuthenticationService.getInstance();
        this._userService = services_1.UserService.getInstance();
        this._awsService = services_1.AwsService.getInstance();
        this._accessoriesService = accessories_service_1.AccessoriesService.getInstance();
        this._mailerService = services_1.MailerService.getInstance();
        this._stockService = services_1.StockService.getInstance();
        this._tradeService = services_1.TradeService.getInstance();
        this._groupService = group_service_1.GroupService.getInstance();
        this._notificationService = services_1.NotificationService.getInstance();
        this._postService = post_service_1.PostService.getInstance();
        this._fmpService = services_1.FmpService.getInstance();
        this._badgeService = services_1.BadgeService.getInstance();
        this._returnService = services_1.ReturnService.getInstance();
        this._chatService = chat_service_1.ChatService.getInstance();
        this._newsService = services_1.NewsService.getInstance();
        this._customScenarioService = services_1.CustomScenarioService.getInstance();
    }
    /**
     * Get the router object for the controller
     */
    getRoutes() {
        this.logger.debug("Retrieving routes for controller");
        return this.router;
    }
}
exports.Controller = Controller;
//# sourceMappingURL=controller.interface.js.map