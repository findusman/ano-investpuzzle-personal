"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeService = void 0;
const moment = require("moment");
const models_1 = require("_app/models");
const services_1 = require("_app/services");
const mongoose_1 = require("mongoose");
const exceptions_1 = require("_app/exceptions");
class BadgeService {
    constructor() {
        this.user = models_1.userModel;
        this.badge = models_1.badgeModel;
        this.receivedBadge = models_1.userBadgeModel;
        this.notification = models_1.notificationModel;
        this.notificationService = new services_1.NotificationService();
    }
    static getInstance() {
        if (!BadgeService._sharedInstance) {
            BadgeService._sharedInstance = new BadgeService();
        }
        return BadgeService._sharedInstance;
    }
    async getBadgeById(id) {
        const query = this.badge.findById(id);
        return await query;
    }
    async getBadgeByTitle(title) {
        return await this.badge.findOne({ title });
    }
    async getReceivedBadgeById(id) {
        const query = this.receivedBadge.findById(id);
        return await query;
    }
    async registerReceivedBadge(badgeId, userId) {
        const badgeExistForThisUser = await this.receivedBadge.findOne({ badge: new mongoose_1.default.Types.ObjectId(badgeId), user: new mongoose_1.default.Types.ObjectId(userId) });
        if (badgeExistForThisUser) {
            throw new exceptions_1.HttpException(400, "This user already received this badge");
        }
        else {
            const receivedBadgeItem = await this.receivedBadge.create({
                badge: new mongoose_1.default.Types.ObjectId(badgeId),
                user: new mongoose_1.default.Types.ObjectId(userId),
                createdAt: moment().unix() * 1000,
            });
            await this.notificationService.createNotification(userId.toString(), userId.toString(), 7, "", "Congratulation! you earned a new badge", 1);
            return receivedBadgeItem;
        }
    }
    async getAllBadges() {
        return await this.badge.find();
    }
    async getUserBadges(userId) {
        let availableBadges = await this.badge.find();
        const userBadges = await Promise.all(availableBadges.map(async (oneBadge, i) => {
            const userReceivedThisBadge = await this.receivedBadge.findOne({ user: new mongoose_1.default.Types.ObjectId(userId), badge: oneBadge._id });
            if (userReceivedThisBadge) {
                oneBadge.isReceived = true;
                oneBadge.receivedAt = userReceivedThisBadge.createdAt;
                return oneBadge;
            }
            else {
                return oneBadge;
            }
        }));
        return userBadges;
    }
}
exports.BadgeService = BadgeService;
BadgeService._sharedInstance = null;
//# sourceMappingURL=badge.service.js.map