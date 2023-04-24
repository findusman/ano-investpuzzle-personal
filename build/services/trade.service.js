"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeService = void 0;
const models_1 = require("_app/models");
const dtos_1 = require("_app/dtos");
const mongoose_1 = require("mongoose");
const exceptions_1 = require("_app/exceptions");
class TradeService {
    constructor() {
        this.buy = models_1.buyModel;
        this.sell = models_1.sellModel;
        this.holding = models_1.holdingModel;
        this.user = models_1.userModel;
        this.profileData = dtos_1.UpdateProfileDto;
        this.stock = models_1.stockModel;
    }
    static getInstance() {
        if (!TradeService._sharedInstance) {
            TradeService._sharedInstance = new TradeService();
        }
        return TradeService._sharedInstance;
    }
    async getfirstTradeOfUser(userId) {
        const firstTrade = await this.buy.findOne({ user: new mongoose_1.default.Types.ObjectId(userId) }); //, 'createdAt.0' : 1
        return firstTrade;
    }
    async createTrade(user, tradeData) {
        var _a;
        const stock = await this.stock.findById(tradeData.stock);
        if (stock) {
            var currentAmount = 0;
            var currentQuantity = 0;
            var currentUsdAmount = 0;
            const holding = await this.holding.findOne({ user: user._id, stock: tradeData.stock });
            if (holding) {
                currentAmount = holding.amount;
                currentQuantity = holding.quantity;
                currentUsdAmount = (_a = holding.usdAmount) !== null && _a !== void 0 ? _a : 0;
            }
            if (tradeData.isBuy === 1) {
                const buy = await this.buy.create({
                    user: user._id,
                    stock: tradeData.stock,
                    amount: tradeData.amount,
                    quantity: tradeData.quantity,
                    currency: tradeData.currency,
                    usdAmount: tradeData.usdAmount,
                    currencyRate: tradeData.currencyRate,
                });
                const update = { availableFunds: user.availableFunds - tradeData.usdAmount };
                await this.user.findByIdAndUpdate(user._id, update);
                const holdingQuery = { user: user._id, stock: tradeData.stock };
                const updateItem = {
                    user: user._id,
                    stock: tradeData.stock,
                    amount: currentAmount + tradeData.amount,
                    quantity: currentQuantity + tradeData.quantity,
                    usdAmount: currentUsdAmount + tradeData.usdAmount,
                };
                await this.holding.findOneAndUpdate(holdingQuery, updateItem, { upsert: true });
                return buy;
            }
            else {
                const holdingQuery = { user: user._id, stock: tradeData.stock };
                if (currentQuantity > tradeData.quantity) {
                    const sell = await this.sell.create({
                        user: user._id,
                        stock: tradeData.stock,
                        amount: tradeData.amount,
                        quantity: tradeData.quantity,
                        currency: tradeData.currency,
                        usdAmount: tradeData.usdAmount,
                        currencyRate: tradeData.currencyRate,
                    });
                    const update = { availableFunds: user.availableFunds + tradeData.usdAmount };
                    await this.user.findByIdAndUpdate(user._id, update);
                    const updateItem = {
                        user: user._id,
                        stock: tradeData.stock,
                        amount: currentAmount - tradeData.amount,
                        quantity: currentQuantity - tradeData.quantity,
                        usdAmount: currentUsdAmount - tradeData.usdAmount,
                    };
                    await this.holding.findOneAndUpdate(holdingQuery, updateItem, { upsert: true });
                    return sell;
                }
                else if (currentQuantity == tradeData.quantity) {
                    const sell = await this.sell.create({
                        user: user._id,
                        stock: tradeData.stock,
                        amount: tradeData.amount,
                        quantity: tradeData.quantity,
                        currency: tradeData.currency,
                        usdAmount: tradeData.usdAmount,
                        currencyRate: tradeData.currencyRate,
                    });
                    const update = { availableFunds: user.availableFunds + tradeData.usdAmount };
                    await this.user.findByIdAndUpdate(user._id, update);
                    await this.holding.findOneAndDelete(holdingQuery);
                    return sell;
                }
                else {
                    throw new exceptions_1.NotFoundException("Selling stock can't bigger than avaialble one");
                }
            }
        }
        else {
            throw new exceptions_1.NotFoundException("Stock");
        }
    }
    async getInvestedSectors(userId) {
        let sectorColors = [
            {
                "sector": "Basic Materials",
                "color": "#470D69"
            },
            {
                "sector": "Communication Services",
                "color": "#2256CD"
            },
            {
                "sector": "Consumer Cyclical",
                "color": "#0BA1DD"
            },
            {
                "sector": "Consumer Defensive",
                "color": "#59C1D0"
            },
            {
                "sector": "Healthcare",
                "color": "#801780"
            },
            {
                "sector": "Industrials",
                "color": "#CBEDD5"
            },
            {
                "sector": "Utilities",
                "color": "#97DECE"
            },
            {
                "sector": "Technology",
                "color": "#449A97"
            },
            {
                "sector": "Financial Services",
                "color": "#005555"
            },
            {
                "sector": "Real State",
                "color": "#9867C5"
            },
            {
                "sector": "Energy",
                "color": "#B8EBF2"
            }
        ];
        const userData = await this.user.findById(userId);
        const total = await this.holding.aggregate([
            {
                $match: { user: new mongoose_1.default.Types.ObjectId(userId) },
            },
            {
                $lookup: {
                    from: "stocks",
                    localField: "stock",
                    foreignField: "_id",
                    as: "stock",
                },
            },
            {
                $unwind: "$stock",
            },
            {
                $lookup: {
                    from: "currencyexchanges",
                    as: "currencyexchange",
                    localField: "stock.currency",
                    foreignField: "currency",
                },
            },
            {
                $unwind: "$currencyexchange",
            },
            {
                $project: {
                    _id: 0,
                    stock: 1,
                    subTotal: {
                        $multiply: [
                            "$stock.price",
                            "$quantity",
                            "$currencyexchange.ask"
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: "$user",
                    total: { $sum: "$subTotal" },
                },
            },
        ]);
        const sectors = await this.holding.aggregate([
            {
                $match: { user: new mongoose_1.default.Types.ObjectId(userId) },
            },
            {
                $lookup: {
                    from: "stocks",
                    as: "stock",
                    localField: "stock",
                    foreignField: "_id",
                },
            },
            {
                $unwind: "$stock",
            },
            {
                $lookup: {
                    from: "currencyexchanges",
                    as: "currencyexchange",
                    localField: "stock.currency",
                    foreignField: "currency",
                },
            },
            {
                $unwind: "$currencyexchange",
            },
            {
                $project: {
                    _id: 0,
                    stock: 1,
                    quantity: 1,
                    stockTotal: {
                        $multiply: [
                            "$stock.price",
                            "$quantity",
                            "$currencyexchange.ask"
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: "$stock.sector",
                    total: {
                        $sum: "$stockTotal",
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    sector: "$_id",
                    total: 1,
                    percent: {
                        $round: [
                            {
                                $multiply: [
                                    {
                                        $divide: ["$total", total.length > 0 ? total[0].total + userData.availableFunds : userData.availableFunds],
                                    },
                                    100,
                                ],
                            },
                            2,
                        ],
                    },
                },
            },
            {
                $sort: { total: -1 },
            },
        ]);
        sectors.map((sectorObj, index) => {
            let sector = sectorObj.sector;
            var colorIndex = sectorColors.findIndex(item => item.sector === sector);
            if (colorIndex >= 0)
                sectors[index]['color'] = sectorColors[colorIndex].color;
            else
                sectors[index]['color'] = "#000000";
        });
        const cashPercent = (userData.availableFunds / (total.length > 0 ? total[0].total + userData.availableFunds : userData.availableFunds)) * 100;
        return { total: total.length > 0 ? total[0].total : 0, cashPercent, sectors };
    }
    async getTop5Holdings(userId) {
        const userData = await this.user.findById(userId);
        const total = await this.holding.aggregate([
            {
                $match: { user: new mongoose_1.default.Types.ObjectId(userId) },
            },
            {
                $lookup: {
                    from: "stocks",
                    localField: "stock",
                    foreignField: "_id",
                    as: "stock",
                },
            },
            {
                $unwind: "$stock",
            },
            {
                $lookup: {
                    from: "currencyexchanges",
                    as: "currencyexchange",
                    localField: "stock.currency",
                    foreignField: "currency",
                },
            },
            {
                $unwind: "$currencyexchange",
            },
            {
                $project: {
                    _id: 0,
                    stock: 1,
                    subTotal: {
                        $multiply: [
                            "$stock.price",
                            "$quantity",
                            "$currencyexchange.ask"
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: "$user",
                    total: { $sum: "$subTotal" },
                },
            },
        ]);
        const stocks = await this.holding.aggregate([
            {
                $match: { user: new mongoose_1.default.Types.ObjectId(userId) },
            },
            {
                $lookup: {
                    from: "stocks",
                    localField: "stock",
                    foreignField: "_id",
                    as: "stock",
                },
            },
            {
                $unwind: "$stock",
            },
            {
                $lookup: {
                    from: "currencyexchanges",
                    as: "currencyexchange",
                    localField: "stock.currency",
                    foreignField: "currency",
                },
            },
            {
                $unwind: "$currencyexchange",
            },
            {
                $project: {
                    _id: 0,
                    stock: 1,
                    quantity: 1,
                    currencyexchange: 1,
                    total: {
                        $multiply: [
                            "$stock.price",
                            "$quantity",
                            "$currencyexchange.ask"
                        ],
                    },
                    percent: {
                        $round: [
                            {
                                $multiply: [
                                    {
                                        $divide: [
                                            {
                                                $multiply: [
                                                    "$stock.price",
                                                    "$quantity",
                                                    "$currencyexchange.ask"
                                                ],
                                            },
                                            total.length > 0 ? total[0].total + userData.availableFunds : userData.availableFunds
                                        ],
                                    },
                                    100,
                                ],
                            },
                            2,
                        ],
                    },
                },
            },
            {
                $addFields: {
                    "stock.id": "$stock._id",
                },
            },
            {
                $unset: ["stock._id"],
            },
            {
                $sort: { percent: -1 },
            },
            {
                $limit: 5,
            },
        ]);
        const cashPercent = (userData.availableFunds / (total.length > 0 ? total[0].total + userData.availableFunds : userData.availableFunds)) * 100;
        return { total: total.length > 0 ? total[0].total : 0, cashPercent, stocks };
    }
}
exports.TradeService = TradeService;
TradeService._sharedInstance = null;
//# sourceMappingURL=trade.service.js.map