"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomScenarioService = void 0;
const moment = require("moment");
const models_1 = require("_app/models");
const services_1 = require("_app/services");
const mongoose_1 = require("mongoose");
const exceptions_1 = require("_app/exceptions");
class CustomScenarioService {
    constructor() {
        this.user = models_1.userModel;
        this.badge = models_1.badgeModel;
        this.receivedBadge = models_1.userBadgeModel;
        this.notification = models_1.notificationModel;
        this.customScenarioValue = models_1.customScenarioValueModel;
        this.customScenario = models_1.customScenarioModel;
        this.stock = models_1.stockModel;
        this.stockService = services_1.StockService._sharedInstance;
        this.notificationService = new services_1.NotificationService();
    }
    static getInstance() {
        if (!CustomScenarioService._sharedInstance) {
            CustomScenarioService._sharedInstance = new CustomScenarioService();
        }
        return CustomScenarioService._sharedInstance;
    }
    async matchStock(stockId) {
        var e_1, _a;
        let regionBreakdownValue = 0;
        let sectorBreakdownValue = 0;
        let marketCapBreakdownValue = 0;
        let BetaBreakdownValue = 0;
        let stockWithRegion = await this.stockService.getStockByIdWithRegion(stockId);
        let stockSector = stockWithRegion[0].sector;
        let stockmarketCap = stockWithRegion[0].marketCap;
        let stockRegion = stockWithRegion[0].region[0].region;
        let stockBeta = stockWithRegion[0].beta;
        console.log([stockSector, stockmarketCap, stockRegion, stockBeta]);
        let scenarios = await this.getAllCustomScenarios();
        let scenariosJSON = JSON.parse(JSON.stringify(scenarios));
        try {
            for (var scenariosJSON_1 = __asyncValues(scenariosJSON), scenariosJSON_1_1; scenariosJSON_1_1 = await scenariosJSON_1.next(), !scenariosJSON_1_1.done;) {
                const scenario = scenariosJSON_1_1.value;
                const scenarioCategory = scenario.category;
                const scenariosubCategory = scenario.subCategory;
                const scenariovalue = scenario.value;
                if (scenariovalue != 0) {
                    // console.log([scenarioCategory, scenariosubCategory, scenariovalue]);
                    if (scenarioCategory === "sector") {
                        //console.log(['----- sector', scenarioCategory, scenariosubCategory, scenariovalue]);
                        if (scenariosubCategory == stockSector)
                            sectorBreakdownValue = scenariovalue;
                    }
                    else if (scenarioCategory === "region") {
                        //console.log({ '-----Stock Region': stockRegion, 'Country Region': scenariosubCategory });
                        if (scenariosubCategory == stockRegion)
                            regionBreakdownValue = scenariovalue;
                    }
                    else if (scenarioCategory === "Market Cap") {
                        //console.log({ 'Stock Market Cap': stockmarketCap, 'Scenario Cap': scenariosubCategory }, { 'scenario': scenariovalue });
                        let stockmarketCapInBillions = stockmarketCap / 1000 / 1000 / 1000;
                        console.log(stockmarketCapInBillions);
                        if (scenariosubCategory == 'Small (< $2B)' && stockmarketCapInBillions <= 2)
                            marketCapBreakdownValue = scenariovalue;
                        else if (scenariosubCategory == 'Medium ($2-$10B)' && (stockmarketCapInBillions > 2 && stockmarketCapInBillions <= 10))
                            marketCapBreakdownValue = scenariovalue;
                        else if (scenariosubCategory == 'Large ($10-$100B)' && (stockmarketCapInBillions > 10 && stockmarketCapInBillions <= 100))
                            marketCapBreakdownValue = scenariovalue;
                        else if (scenariosubCategory == 'Mega ($100B+)' && (stockmarketCapInBillions > 100))
                            marketCapBreakdownValue = scenariovalue;
                        // else if (scenarioCategory == stockRegion)
                        //   regionBreakdownValue = scenariovalue;
                        // else if (scenarioCategory == stockmarketCap)
                        //   marketCapBreakdownValue = scenariovalue;
                    }
                    else if (scenarioCategory === "Beta Breakdown") {
                        // console.log({ 'Stock Market Cap': stockmarketCap, 'Scenario Cap': scenariosubCategory }, { 'scenario': scenariovalue });
                        if (scenariosubCategory == 'Stocks with Beta (<1.00)' && stockBeta <= 1)
                            BetaBreakdownValue = scenariovalue;
                        else if (scenariosubCategory == 'Stocks with Beta (1.00-1.50)' && (stockBeta > 1 && stockBeta <= 1.5))
                            BetaBreakdownValue = scenariovalue;
                        else if (scenariosubCategory == 'Stocks with Beta (1.51-2.00)' && (stockBeta > 1.5 && stockBeta <= 2.0))
                            BetaBreakdownValue = scenariovalue;
                        else if (scenariosubCategory == 'Stocks with Beta (2.00+)' && (stockBeta > 2.0))
                            BetaBreakdownValue = scenariovalue;
                        // else if (scenarioCategory == stockRegion)
                        //   regionBreakdownValue = scenariovalue;
                        // else if (scenarioCategory == stockmarketCap)
                        //   marketCapBreakdownValue = scenariovalue;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (scenariosJSON_1_1 && !scenariosJSON_1_1.done && (_a = scenariosJSON_1.return)) await _a.call(scenariosJSON_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        let _totalBreakDownValue = regionBreakdownValue + sectorBreakdownValue + marketCapBreakdownValue + BetaBreakdownValue;
        // console.log(_totalBreakDownValue);
        // console.log({ 'region': regionBreakdownValue }, { 'sector': sectorBreakdownValue }, { 'market cap': marketCapBreakdownValue });
        return (1 + (_totalBreakDownValue / 100));
    }
    async getAllCustomScenarios() {
        var e_2, _a;
        let scenarios = await this.customScenario.find().sort('category');
        let scenariosJSON = JSON.parse(JSON.stringify(scenarios));
        try {
            for (var scenariosJSON_2 = __asyncValues(scenariosJSON), scenariosJSON_2_1; scenariosJSON_2_1 = await scenariosJSON_2.next(), !scenariosJSON_2_1.done;) {
                const scenario = scenariosJSON_2_1.value;
                const scenarioID = scenario._id;
                scenario.id = scenario._id;
                let docValues = await this.customScenarioValue.findOne({ "scenarioID": new mongoose_1.default.Types.ObjectId(scenarioID) }).exec();
                if (docValues)
                    scenario.value = docValues.value;
                else
                    scenario.value = 0;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (scenariosJSON_2_1 && !scenariosJSON_2_1.done && (_a = scenariosJSON_2.return)) await _a.call(scenariosJSON_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return scenariosJSON;
    }
    async addValue(userId, scenarioBody) {
        // console.log(scenarioBody);
        // console.log(JSON.stringify(scenarioBody));
        // console.log(JSON.parse(JSON.stringify(scenarioBody)));
        await this.customScenarioValue.deleteMany({});
        await Promise.all(JSON.parse(scenarioBody).map(async (singdoc) => {
            singdoc.user = new mongoose_1.default.Types.ObjectId(userId);
            const scenarioValue = await this.customScenarioValue.create({
                user: new mongoose_1.default.Types.ObjectId(userId),
                scenarioID: new mongoose_1.default.Types.ObjectId(singdoc.scenarioID),
                value: singdoc.value,
                category: singdoc.category,
                createdAt: moment().unix() * 1000,
            });
        }));
        // console.log(scenarioBody);
        // const scenarioValue = await this.customScenario.create({
        //   user: new mongoose.Types.ObjectId(userId),
        //   scenarioID: new mongoose.Types.ObjectId(scenarioID),
        //   value: value,
        //   scenarioBy: scenarioBy,
        //   createdAt: moment().unix() * 1000,
        // });
        return;
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
exports.CustomScenarioService = CustomScenarioService;
CustomScenarioService._sharedInstance = null;
//# sourceMappingURL=customScenario.service.js.map