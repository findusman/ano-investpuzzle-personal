"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const moment = require("moment");
const models_1 = require("_app/models");
const config_1 = require("_app/config");
const mongoose_1 = require("mongoose");
const exceptions_1 = require("_app/exceptions");
const axios_1 = require("axios");
class NotificationService {
    constructor() {
        this.user = models_1.userModel;
        this.notification = models_1.notificationModel;
        this.group = models_1.groupModel;
    }
    static getInstance() {
        if (!NotificationService._sharedInstance) {
            NotificationService._sharedInstance = new NotificationService();
        }
        return NotificationService._sharedInstance;
    }
    async getNotificationById(id) {
        const query = this.notification.findById(id);
        return await query;
    }
    async getNotificationBySender(sender) {
        return await this.notification.findOne({ sender });
    }
    async getNotificationByReceiver(receiver) {
        return await this.notification.findOne({ receiver });
    }
    async getNotificationBySenerReceiverAndType(sender, receiver, type) {
        return await this.notification.findOne({ sender, receiver, type });
    }
    async removeNotification(userId, notiId) {
        const notiObj = await this.getNotificationById(notiId);
        if (notiObj) {
            if (userId.toString() != notiObj.receiver.toString()) {
                throw new exceptions_1.HttpException(400, "This isn't your notification");
            }
            else {
                return await this.notification.findByIdAndDelete(notiId);
            }
        }
        else {
            throw new exceptions_1.HttpException(400, "This notification doesn't exist");
        }
    }
    async updateNotiReadStatus(userId, notiIds) {
        for (var i = 0; i < notiIds.length; i++) {
            const notiObj = await this.getNotificationById(notiIds[i]);
            if (notiObj) {
                if (userId.toString() === notiObj.receiver.toString()) {
                    await this.notification.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(notiIds[i]), { isRead: 1 });
                }
            }
        }
    }
    async createNotification(sender, receiver, type, linkedId, content, isAccepted) {
        const notificationItem = await this.notification.create({
            type: type,
            sender: sender.length > 0 ? new mongoose_1.default.Types.ObjectId(sender) : null,
            receiver: new mongoose_1.default.Types.ObjectId(receiver),
            linkedId: linkedId,
            content: content,
            isRead: 0,
            isAccept: isAccepted,
            createdAt: moment().unix() * 1000,
        });
        const userData = await this.user.findById(receiver);
        if (userData && userData.token != null) {
            let notiContent;
            switch (type) {
                case 0:
                    const senderData = await this.user.findById(sender);
                    notiContent = senderData.userFullName + " wants to follow you";
                    break;
                case 1:
                    const senderData1 = await this.user.findById(sender);
                    notiContent = senderData1.userFullName + " accepted your follow request";
                    break;
                case 2:
                    notiContent = content;
                    break;
                case 3:
                    const senderData3 = await this.user.findById(sender);
                    notiContent = senderData3.userFullName + " accepted your group request";
                    break;
                case 4:
                    const senderData4 = await this.user.findById(sender);
                    notiContent = senderData4.userFullName + " posted a new Forum";
                    break;
                case 5:
                    const senderData5 = await this.user.findById(sender);
                    notiContent = senderData5.userFullName + " commented on your post on forums";
                    break;
                case 6:
                    const senderData6 = await this.user.findById(sender);
                    notiContent = senderData6.userFullName + " liked on your post on forums";
                    break;
                case 7:
                    notiContent = "Congratulation! You earned a new badge";
                    break;
                case 8:
                    const senderData8 = await this.user.findById(sender);
                    notiContent = senderData8.userFullName + " liked on your comment";
                    break;
                case 9:
                    const senderData9 = await this.user.findById(sender);
                    notiContent = senderData9.userFullName + " replied on your comment";
                    break;
                case 10:
                    const senderData10 = await this.user.findById(sender);
                    notiContent = senderData10.userFullName + " sent a request to join on your private group";
                    break;
                case 11:
                    const senderData11 = await this.user.findById(sender);
                    notiContent = senderData11.userFullName + " accepted your group join request";
                    break;
                case 10:
                    notiContent = "New user added in your group";
                    break;
            }
            await this.sendPushNotification(userData.token, "WaffleStock Notification", notiContent, "1");
        }
        return notificationItem;
    }
    async sendPushNotification(token, title, content, unread) {
        const url = "https://fcm.googleapis.com/fcm/send";
        const notification = {
            body: content,
            title: title,
            sound: "notisound.mp3",
        };
        const notiData = {
            body: content,
            title: title,
            sound: "notisound.mp3",
            // "badge" => $unread,
            // "type" => $type,
        };
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${config_1.Env.FIREBASE_PUSH_API_KEY}`
            }
        };
        try {
            const { data } = await axios_1.default.post(url, {
                to: token,
                priority: "high",
                notification: notification,
                data: notiData,
            }, config);
            //console.log(data); 
        }
        catch (error) {
            console.log(error);
        }
    }
    async updateNotiAccept(_id, isAccept) {
        return await this.notification.findOneAndUpdate({ _id }, { isAccept });
    }
    async getMyNotifications(userId, limit, page, skip, keyword, filterType, orderBy) {
        const filter = filterType != -1
            ? {
                receiver: new mongoose_1.default.Types.ObjectId(userId),
                type: filterType,
            }
            : { receiver: new mongoose_1.default.Types.ObjectId(userId) };
        const notificationQuery = this.notification
            .find(filter)
            .skip(skip)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate({ path: "sender" });
        const total = await this.notification.find().merge(notificationQuery).skip(0).limit(null).countDocuments();
        const notifications = await notificationQuery;
        let notiObjects = [];
        await Promise.all(notifications.map(async (noti) => {
            if (noti.type == 2) {
                const groupInfo = await this.group.findOne({ _id: noti.linkedId });
                noti.groupData = groupInfo;
                // console.log(groupInfo);
                // console.log(noti);       
            }
            ;
            notiObjects.push(noti);
        }));
        return {
            notifications: notiObjects || [],
            page: Number(page),
            limit: Number(limit),
            total,
        };
    }
}
exports.NotificationService = NotificationService;
NotificationService._sharedInstance = null;
//# sourceMappingURL=notification.service.js.map