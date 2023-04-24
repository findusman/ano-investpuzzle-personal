"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("_app/interfaces");
const middlewares_1 = require("_app/middlewares");
const dtos_1 = require("_app/dtos");
const utils_1 = require("_app/utils");
class ChatController extends interfaces_1.Controller {
    constructor(loggerFactory) {
        super("/chat", loggerFactory.getNamedLogger("chat-controller"));
        this.getRoomData = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const myId = currentUser._id.toString();
                const { user } = request.body;
                const data = await this._chatService.getRoomDetail(myId, user);
                response.status(200).send({ message: "success", data: data });
            }
            catch (error) {
                next(error);
            }
        };
        this.getRoomDataById = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const roomId = request.params.id;
                const data = await this._chatService.getRoomDetailById(roomId);
                response.status(200).send({ message: "success", data: data });
            }
            catch (error) {
                next(error);
            }
        };
        this.saveChatMessage = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const myId = currentUser._id.toString();
                const { sender, room, message, messageType } = request.body;
                const data = await this._chatService.saveChat(room, sender, message, messageType);
                response.status(200).send({ message: "success", data: data });
            }
            catch (error) {
                next(error);
            }
        };
        this.getChatRooms = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const { page, skip, limit } = (0, utils_1.getPaginator)(request);
                const data = await this._chatService.getMyChatRooms(currentUser._id, limit, page, skip);
                response.send(data);
            }
            catch (error) {
                next(error);
            }
        };
        this.getHistory = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const roomId = request.params.id;
                const { page, skip, limit } = (0, utils_1.getPaginator)(request);
                const data = await this._chatService.getChatHistory(roomId, limit, page, skip);
                response.send(data);
            }
            catch (error) {
                next(error);
            }
        };
        this.getGroupHistory = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const roomId = request.params.id;
                const { page, skip, limit } = (0, utils_1.getPaginator)(request);
                const data = await this._chatService.getGroupChatHistory(roomId, limit, page, skip);
                response.send(data);
            }
            catch (error) {
                next(error);
            }
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/getroom`, (0, middlewares_1.validationMiddleware)(dtos_1.GetRoomDataDto), (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getRoomData);
        this.router.post(`${this.path}/:id/roomdetail`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getRoomDataById);
        this.router.post(`${this.path}/savemessage`, (0, middlewares_1.validationMiddleware)(dtos_1.ChatMessageDto), (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.saveChatMessage);
        this.router.get(`${this.path}/contacts`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getChatRooms);
        this.router.get(`${this.path}/:id/history`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getHistory);
        this.router.get(`${this.path}/:id/groupmessage`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getGroupHistory);
    }
}
exports.default = ChatController;
//# sourceMappingURL=chat.controller.js.map