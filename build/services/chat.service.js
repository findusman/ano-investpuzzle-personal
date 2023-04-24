"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const moment = require("moment");
const models_1 = require("_app/models");
const mongoose_1 = require("mongoose");
const exceptions_1 = require("_app/exceptions");
class ChatService {
    constructor() {
        this.user = models_1.userModel;
        this.chatRoom = models_1.chatroomModel;
        this.chat = models_1.chatModel;
        this.group = models_1.groupModel;
    }
    static getInstance() {
        if (!ChatService._sharedInstance) {
            ChatService._sharedInstance = new ChatService();
        }
        return ChatService._sharedInstance;
    }
    async getChatRoomById(id) {
        const query = this.chatRoom.findById(id);
        return await query;
    }
    async getRoomDetail(myId, userId) {
        var roomName = userId + "_" + myId;
        const roomExt1 = await this.chatRoom.findOne({ room: roomName });
        if (roomExt1) {
        }
        else {
            roomName = myId + "_" + userId;
            const roomExt2 = await this.chatRoom.findOne({ room: roomName });
            if (roomExt2) {
            }
            else {
                await this.chatRoom.create({
                    creator: new mongoose_1.default.Types.ObjectId(myId),
                    user: new mongoose_1.default.Types.ObjectId(userId),
                    room: roomName,
                    createdAt: moment().unix() * 1000,
                });
            }
        }
        var roomData = await this.chatRoom.findOne({ room: roomName }).populate('user').populate('creator');
        return roomData;
    }
    async getRoomDetailById(roomId) {
        const roomObj = await this.getChatRoomById(roomId);
        if (roomObj) {
            var roomData = await this.chatRoom.findById(roomId).populate('user').populate('creator');
            return roomData;
        }
        else {
            throw new exceptions_1.HttpException(400, "room not exist");
        }
    }
    async saveChat(room, sender, message, messageType) {
        // var chatItem = await this.chat.create({
        //   sender: new mongoose.Types.ObjectId(sender),
        //   room: new mongoose.Types.ObjectId(room),
        //   message: message,
        //   messageType :messageType,        
        //   createdAt: moment().unix() * 1000,
        // });
        var roomItem = await this.chatRoom.findOneAndUpdate({ _id: new mongoose_1.default.Types.ObjectId(room) }, { lastMessageSender: new mongoose_1.default.Types.ObjectId(sender), lastMessage: message, messageType: messageType, updatedAt: moment().unix() * 1000 });
        return roomItem;
    }
    async getMyChatRooms(userId, limit, page, skip) {
        const filter = {};
        let filterQuery = [];
        filterQuery.push({ creator: new mongoose_1.default.Types.ObjectId(userId) });
        filterQuery.push({ user: new mongoose_1.default.Types.ObjectId(userId) });
        filterQuery.length > 0 ? (filter.$or = filterQuery) : null;
        const chatRoomsQuery = this.chatRoom
            .find(filter)
            .skip(skip)
            .sort({ updatedAt: -1 })
            .limit(limit);
        // .populate({ path: "creator" })
        // .populate({ path: "user" });
        const total = await this.chatRoom.find().merge(chatRoomsQuery).skip(0).limit(null).countDocuments();
        const chatRooms = await chatRoomsQuery;
        const data = [];
        await Promise.all(chatRooms.map(async (chatRoomObj, index) => {
            let creatorId = chatRoomObj.creator;
            let userData;
            if (creatorId.toString() === userId.toString()) {
                userData = await this.user.findById(chatRoomObj.user.toString());
            }
            else {
                userData = await this.user.findById(creatorId.toString());
            }
            let chatRoom = Object.assign(Object.assign({}, chatRoomObj._doc), { id: chatRoomObj._doc._id });
            data.push(Object.assign({ userData }, chatRoom));
            //console.log();
        }));
        return {
            chatRooms: data || [],
            page: Number(page),
            limit: Number(limit),
            total,
        };
    }
    async getChatHistory(roomId, limit, page, skip) {
        const roomObj = await this.getChatRoomById(roomId);
        if (roomObj) {
            const chatQuery = this.chat
                .find({ room: new mongoose_1.default.Types.ObjectId(roomId) })
                .skip(skip)
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate({ path: "sender" });
            const total = await this.chatRoom.find().merge(chatQuery).skip(0).limit(null).countDocuments();
            const messages = await chatQuery;
            return {
                messages: messages || [],
                page: Number(page),
                limit: Number(limit),
                total,
            };
        }
        else {
            throw new exceptions_1.HttpException(400, "room not exist");
        }
    }
    async getGroupChatHistory(roomId, limit, page, skip) {
        const roomObj = await this.group.findById(roomId);
        if (roomObj) {
            const chatQuery = this.chat
                .find({ room: new mongoose_1.default.Types.ObjectId(roomId) })
                .skip(skip)
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate({ path: "sender" });
            const total = await this.chatRoom.find().merge(chatQuery).skip(0).limit(null).countDocuments();
            const messages = await chatQuery;
            return {
                messages: messages || [],
                page: Number(page),
                limit: Number(limit),
                total,
            };
        }
        else {
            throw new exceptions_1.HttpException(400, "group not exist");
        }
    }
}
exports.ChatService = ChatService;
ChatService._sharedInstance = null;
//# sourceMappingURL=chat.service.js.map