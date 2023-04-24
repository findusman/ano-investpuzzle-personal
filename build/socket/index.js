"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketConnection = exports.initSocketConnect = void 0;
const socket_io_1 = require("socket.io");
const middlewares_1 = require("./middlewares");
const socket_enum_1 = require("_app/enums/socket.enum");
const services_1 = require("_app/services");
let connection = null;
class SocketApp {
    constructor() {
        this.chatService = new services_1.ChatService();
    }
    connect(server) {
        console.log("socket connect");
        this.socketServer = new socket_io_1.Server(server, {
            cors: {
                origin: ["http://localhost:3000", "https://wafflestock.com"],
                credentials: true,
            },
        });
        this.socketServer.use((0, middlewares_1.socketAuthMiddleware)()); // Initialize Middlewares
        this.socketServer.on("connection", (socket) => {
            const user = socket.request.user;
            socket.join("data");
            socket.on("join", async ({ room }) => {
                socket.join(room);
            });
            socket.on("sendMessage", async ({ room, message, type }) => {
                await this.chatService.saveChat(room, user._id.toString(), message, type);
                this.sendEvent(room, "message", { room, message, type, user });
            });
            socket.on("sendGroupMessage", async ({ room, message, type }) => {
                await this.chatService.saveChat(room, user._id.toString(), message, type);
                this.sendEvent(room, "groupMessage", { room, message, type, user });
            });
            socket.on("leave", (_) => { });
            socket.on("disconnect", (_) => { });
        });
    }
    handleChannelMessage(user, channelId, message, type, room) {
        const data = {};
        this.socketServer.to(room).emit(socket_enum_1.NOTIFICATION_TYPE.MESSAGE, data);
    }
    sendEvent(room, eventType, data) {
        try {
            this.socketServer.to(room).emit(eventType, data);
        }
        catch (error) {
            console.log(error);
        }
    }
    static init(server) {
        if (!connection) {
            connection = new SocketApp();
            connection.connect(server);
        }
    }
    static getConnection() {
        if (!connection) {
            throw new Error("no active connection");
        }
        return connection;
    }
}
function initSocketConnect(server) {
    return SocketApp.init(server);
}
exports.initSocketConnect = initSocketConnect;
function getSocketConnection() {
    return SocketApp.getConnection();
}
exports.getSocketConnection = getSocketConnection;
//# sourceMappingURL=index.js.map