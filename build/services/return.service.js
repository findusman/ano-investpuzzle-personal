"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnService = void 0;
const models_1 = require("_app/models");
const fmp_service_1 = require("./fmp.service");
const stock_service_1 = require("./stock.service");
const notification_service_1 = require("./notification.service");
class ReturnService {
    constructor() {
        this.fmpService = new fmp_service_1.FmpService();
        this.stockService = new stock_service_1.StockService();
        this.notificationService = new notification_service_1.NotificationService();
        this.user = models_1.userModel;
        this.returnMinute = models_1.returnMinuteModel;
        this.returnHour = models_1.returnHourModel;
        this.returnDay = models_1.returnDayModel;
        this.rank = models_1.rankModel;
        this.badge = models_1.badgeModel;
        this.userBadge = models_1.userBadgeModel;
    }
    static getInstance() {
        if (!ReturnService._sharedInstance) {
            ReturnService._sharedInstance = new ReturnService();
        }
        return ReturnService._sharedInstance;
    }
    async calculateReturn5Min() {
        try {
            const users = await this.user.find();
            await Promise.all(users.map(async (user) => {
                const returns = await this.stockService.getReturn(user, 0);
                await this.returnMinute.create({
                    user: user._id,
                    returns: !Number.isNaN(returns.returns) ? returns.returns : 0,
                    percents: !Number.isNaN(returns.percents) ? returns.percents : 0,
                    investing: !Number.isNaN(returns.investing) ? returns.investing : 0,
                });
            }));
        }
        catch (error) {
            console.log(error);
        }
    }
    async calculateReturn1Hour() {
        try {
            const users = await this.user.find();
            await Promise.all(users.map(async (user) => {
                const returns = await this.stockService.getReturn(user, 1);
                await this.returnHour.create({
                    user: user._id,
                    returns: !Number.isNaN(returns.returns) ? returns.returns : 0,
                    percents: !Number.isNaN(returns.percents) ? returns.percents : 0,
                    investing: !Number.isNaN(returns.investing) ? returns.investing : 0,
                });
            }));
        }
        catch (error) {
            console.log(error);
        }
    }
    async calculateReturn1Day() {
        try {
            const users = await this.user.find();
            await Promise.all(users.map(async (user) => {
                const returns = await this.stockService.getReturn(user, 2);
                await this.returnDay.create({
                    user: user._id,
                    returns: !Number.isNaN(returns.returns) ? returns.returns : 0,
                    percents: !Number.isNaN(returns.percents) ? returns.percents : 0,
                    investing: !Number.isNaN(returns.investing) ? returns.investing : 0,
                });
            }));
        }
        catch (error) {
            console.log(error);
        }
    }
    async calculateReturnRank() {
        try {
            const users = await this.stockService.getTopRank();
            const ids = users.map(user => user._id);
            await this.rank.create(ids);
            this.checkBadges();
        }
        catch (error) {
            console.log(error);
        }
    }
    async checkBadges() {
        try {
            const badges = await this.badge.find({ type: 1 }).sort({ number: 1 });
            let i = 0;
            do {
                const records = await this.rank.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(new Date().getTime() - badges[i].number * 24 * 60 * 60 * 1000)
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$user",
                            count: { $count: {} },
                        },
                    }
                ]);
                await Promise.all(records.map(async (record) => {
                    if (record.count === badges[i].number) {
                        const data = {
                            user: record._id,
                            badge: badges[i]._id,
                        };
                        const badge = await this.userBadge.findOneAndUpdate(data, data, { upsert: true }); /// after upsert : , new:true;
                        await this.notificationService.createNotification(record._id.toString(), record._id.toString(), 7, badges[i]._id, "Congratulation! You earned a new badge", 1);
                    }
                }));
                i++;
            } while (i < badges.length);
        }
        catch (error) {
            console.log(error);
        }
    }
    async getReturnGraphData(user) {
        const returns = {
            "1D": [],
            "1W": [],
            "1M": [],
            "1Y": [],
            All: [],
        };
        returns["1D"] = await this.getReturnHistory(user, "1D");
        returns["1W"] = await this.getReturnHistory(user, "1W");
        returns["1M"] = await this.getReturnHistory(user, "1M");
        returns["1Y"] = await this.getReturnHistory(user, "1Y");
        returns["All"] = await this.getReturnHistory(user, "All");
        let returnData = {
            "1D": await this.getReturnBetweenDuration(user, "1D"),
            "1W": await this.getReturnBetweenDuration(user, "1W"),
            "1M": await this.getReturnBetweenDuration(user, "1M"),
            "1Y": await this.getReturnBetweenDuration(user, "1Y"),
            "All": await this.getReturnBetweenDuration(user, "All")
        };
        // returnData.push({"1D" : await this.getReturnBetweenDuration(user, "1D")});
        // returnData.push({"1W" :await this.getReturnBetweenDuration(user, "1W")});
        // returnData.push({"1M" :await this.getReturnBetweenDuration(user, "1M")});
        // returnData.push({"1Y" :await this.getReturnBetweenDuration(user, "1Y")});
        // returnData.push({"All" :await this.getReturnBetweenDuration(user, "All")});
        return { returns, returnData };
    }
    async getReturnBetweenDuration(user, option) {
        const currentReturns = await this.stockService.getReturn(user, 2);
        try {
            let data;
            var oldInvesting = user.initFunds;
            switch (option) {
                case "1D":
                    const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
                    const yesterdayEnd = new Date(new Date().getTime() - 23 * 60 * 60 * 1000);
                    data = await this.returnMinute
                        .find({ user: user._id, createdAt: { $gte: yesterday, $lte: yesterdayEnd } })
                        .limit(1)
                        .sort({ createdAt: 1 });
                    oldInvesting = data.length > 0 && data[0].investing ? data[0].investing : currentReturns.investing;
                    break;
                case "1W":
                    const weekAgo = new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000);
                    const weekAgoEnd = new Date(new Date().getTime() - 4 * 24 * 60 * 60 * 1000);
                    data = await this.returnHour.find({ user: user._id, createdAt: { $gte: weekAgo, $lte: weekAgoEnd } }).limit(1).sort({ createdAt: 1 });
                    oldInvesting = data.length > 0 && data[0].investing ? data[0].investing : currentReturns.investing;
                    break;
                case "1M":
                    const monthAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
                    const monthAgoEnd = new Date(new Date().getTime() - 29 * 24 * 60 * 60 * 1000);
                    data = await this.returnDay.find({ user: user._id, createdAt: { $gte: monthAgo, $lte: monthAgoEnd } }).limit(1).sort({ createdAt: 1 });
                    oldInvesting = data.length > 0 && data[0].investing ? data[0].investing : currentReturns.investing;
                    break;
                case "1Y":
                    const yearAgo = new Date(new Date().getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
                    const yearAgoEnd = new Date(new Date().getTime() - 12 * 30 * 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000);
                    data = await this.returnDay.find({ user: user._id, createdAt: { $gte: yearAgo, $lte: yearAgoEnd } }).limit(1).sort({ createdAt: 1 });
                    oldInvesting = data.length > 0 && data[0].investing ? data[0].investing : currentReturns.investing;
                    break;
            }
            const returnValue = currentReturns.investing - oldInvesting;
            const returnPercent = (currentReturns.investing / oldInvesting - 1) * 100;
            return { returnValue, returnPercent };
        }
        catch (error) {
            console.log(error);
            const returnValue = 0;
            const returnPercent = 0;
            return { returnValue, returnPercent };
        }
    }
    async getReturnHistory(user, option) {
        try {
            let data;
            switch (option) {
                case "1D":
                    const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
                    data = await this.returnMinute
                        .find({ user: user._id, createdAt: { $gte: yesterday } })
                        .sort({ createdAt: 1 });
                    break;
                case "1W":
                    const weekAgo = new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000);
                    data = await this.returnHour.find({ user: user._id, createdAt: { $gte: weekAgo } }).sort({ createdAt: 1 });
                    break;
                case "1M":
                    const monthAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
                    data = await this.returnDay.find({ user: user._id, createdAt: { $gte: monthAgo } }).sort({ createdAt: 1 });
                    break;
                case "3M":
                    const quarterYearAgo = new Date(new Date().getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
                    data = await this.returnDay
                        .find({ user: user._id, createdAt: { $gte: quarterYearAgo } })
                        .sort({ createdAt: 1 });
                    break;
                case "6M":
                    const halfYearAgo = new Date(new Date().getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
                    data = await this.returnDay.find({ user: user._id, createdAt: { $gte: halfYearAgo } }).sort({ createdAt: 1 });
                    break;
                case "1Y":
                    const yearAgo = new Date(new Date().getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
                    data = await this.returnDay.find({ user: user._id, createdAt: { $gte: yearAgo } }).sort({ createdAt: 1 });
                    break;
                case "All":
                    data = await this.returnDay.find({ user: user._id }).sort({ createdAt: 1 });
                    break;
            }
            data = await Promise.all(data.map(async (item) => {
                return Object.assign(Object.assign({}, item._doc), { createdAt: new Date(item.createdAt).getTime() });
            }));
            return data;
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.ReturnService = ReturnService;
ReturnService._sharedInstance = null;
//# sourceMappingURL=return.service.js.map