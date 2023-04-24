"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockService = void 0;
const axios_1 = require("axios");
const moment = require("moment");
const mongoose_1 = require("mongoose");
const config_1 = require("_app/config");
const exceptions_1 = require("_app/exceptions");
const models_1 = require("_app/models");
const fmp_service_1 = require("./fmp.service");
class StockService {
    constructor() {
        this.stock = models_1.stockModel;
        this.holding = models_1.holdingModel;
        this.sell = models_1.sellModel;
        this.buy = models_1.buyModel;
        this.returnMinute = models_1.returnMinuteModel;
        this.returnHour = models_1.returnHourModel;
        this.returnDay = models_1.returnDayModel;
        this.stockFollow = models_1.stockFollowModel;
        this.stockComment = models_1.stockCommentModel;
        this.stockCommentLike = models_1.stockCommentLikeModel;
        this.user = models_1.userModel;
        this.fmpService = new fmp_service_1.FmpService();
    }
    static getInstance() {
        if (!StockService._sharedInstance) {
            StockService._sharedInstance = new StockService();
        }
        return StockService._sharedInstance;
    }
    async getStockById(id, currentUserId) {
        const query = this.stock.findById(id);
        if (!currentUserId) {
            return await query;
        }
        return await query.populate({ path: "followed", match: () => ({ user: currentUserId }) }).populate({ path: "holding", match: () => ({ user: currentUserId }) });
    }
    async getStockByIdWithRegion(stockId) {
        let _stockID = new mongoose_1.default.Types.ObjectId(stockId);
        console.log(stockId);
        const stockWithRegion = //this.stock.findById(id);
         await this.stock.
            aggregate([
            {
                $lookup: {
                    from: 'countries',
                    localField: 'country',
                    foreignField: 'code',
                    as: 'region'
                }
            },
            {
                $match: {
                    _id: _stockID
                }
            },
            {
                $project: {
                    _id: 1,
                    symbol: 1,
                    country: 1,
                    marketCap: 1,
                    beta: 1,
                    sector: 1,
                    'region.region': 1
                }
            }
        ]);
        console.log(await JSON.stringify(stockWithRegion));
        return stockWithRegion;
    }
    async getStocklistByTicker(symbol, currentUserId) {
        const query = this.stock.findOne({ symbol });
        if (!currentUserId) {
            return await query;
        }
        return await query.populate({ path: "followed", match: () => ({ user: currentUserId }) }).populate({ path: "holding", match: () => ({ user: currentUserId }) });
    }
    async getStocklistByTitle(title) {
        return await this.stock.findOne({ title });
    }
    async getStocklistByIndustry(industry) {
        return await this.stock.findOne({ industry });
    }
    async getStockCommentById(id) {
        const query = this.stockComment.findById(id);
        return await query;
    }
    async getUserCommentLikeExist(stockcomment, user) {
        return await this.stockCommentLike.findOne({ stockcomment, user });
    }
    async getStocks(userId, limit, page, skip, keyword, filterType, myfollowonly, orderBy) {
        let filterQuery = [];
        let myFollowQuery = [];
        if (filterType === 1 || filterType === 0) {
            keyword ? filterQuery.push({ symbol: new RegExp(keyword, "i") }) : null;
        }
        if (filterType === 2 || filterType === 0) {
            keyword ? filterQuery.push({ name: new RegExp(keyword, "i") }) : null;
        }
        if (filterType === 3 || filterType === 0) {
            keyword ? filterQuery.push({ industry: new RegExp(keyword, "i") }) : null;
        }
        if (filterType === 4 || filterType === 0) {
            keyword ? filterQuery.push({ sector: new RegExp(keyword, "i") }) : null;
        }
        if (myfollowonly === 1) {
            const followedStocks = await this.stockFollow.find({ user: userId });
            const followedIds = followedStocks.map((stockFollow) => stockFollow.stock.toString());
            myFollowQuery.push({ _id: { $in: followedIds } });
        }
        const filter = {};
        filterQuery.length > 0 ? (filter.$or = filterQuery) : null;
        myFollowQuery.length > 0 ? (filter.$and = myFollowQuery) : null;
        const stocksQuery = this.stock
            .find(filter)
            .populate({
            path: "followed",
            match: () => ({ user: userId }),
        })
            .skip(skip)
            .limit(limit);
        if (orderBy) {
            stocksQuery.sort({ _id: 1 });
        }
        else {
            stocksQuery.sort({ createdAt: -1 });
        }
        const total = await this.stock.find().merge(stocksQuery).skip(0).limit(null).countDocuments();
        const stocklist = await stocksQuery;
        return {
            data: stocklist || [],
            page: Number(page),
            limit: Number(limit),
            total,
        };
    }
    async followStock(follow, stockId, userId) {
        if (follow) {
            await this.stockFollow.findOneAndUpdate({ stock: stockId, user: userId }, {}, { upsert: true });
        }
        else {
            await this.stockFollow.findOneAndDelete({ stock: stockId, user: userId });
        }
        return true;
    }
    async saveFavMultiStocks(currentUser, stockIds) {
        let stockIdArrays = stockIds.split(",");
        await Promise.all(stockIdArrays.map(async (stockId) => {
            await this.stockFollow.findOneAndUpdate({ stock: stockId, user: currentUser._id.toString() }, {}, { upsert: true });
        }));
    }
    async getRecomenedStocks() {
        let filterQuery = [];
        filterQuery.push({ symbol: "AAPL" });
        filterQuery.push({ symbol: "TSLA" });
        filterQuery.push({ symbol: "MSFT" });
        filterQuery.push({ symbol: "AMZN" });
        filterQuery.push({ symbol: "SBUX" });
        filterQuery.push({ symbol: "MCD" });
        filterQuery.push({ symbol: "META" });
        filterQuery.push({ symbol: "BABA" });
        const filter = {};
        filter.$or = filterQuery;
        const stocksQuery = this.stock.find(filter);
        //stocksQuery.sort({ _id: 1 });
        const stocklist = await stocksQuery;
        return stocklist;
    }
    async getFollowedStocks(user) {
        const stocks = await this.stockFollow.find({ user: user._id }).populate("stock");
        return stocks;
    }
    async getHoldings(user) {
        const total = await this.holding.aggregate([
            {
                $match: { user: user._id },
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
                    currencyexchange: 1,
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
        const holdings = await this.holding.aggregate([
            {
                $match: { user: user._id },
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
                    currencyexchange: 1,
                    total: {
                        $multiply: [
                            "$stock.price",
                            "$quantity",
                            "$currencyexchange.ask"
                        ],
                    },
                },
            },
            {
                $project: {
                    total: 1,
                    stock: 1,
                    percent: {
                        $round: [
                            {
                                $multiply: [
                                    {
                                        $divide: ["$total", total.length > 0 ? total[0].total + user.availableFunds : user.availableFunds],
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
                $unset: ["_id"],
            },
            {
                $addFields: {
                    "stock.id": "$stock._id",
                },
            },
            {
                $unset: ["stock._id"],
            },
        ]);
        const cashPercent = (user.availableFunds / (total.length > 0 ? total[0].total + user.availableFunds : user.availableFunds)) * 100;
        return { cashPercent, holdings };
    }
    async getReturn(user, returnType) {
        var _a, _b, _c;
        const holdingTotal = await this.holding.aggregate([
            {
                $match: { user: user._id },
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
                    user: 1,
                    currentAmount: {
                        $multiply: ["$quantity", "$stock.price", "$currencyexchange.ask"],
                    },
                },
            },
            {
                $group: {
                    _id: "$user",
                    total: { $sum: "$currentAmount" },
                },
            },
        ]);
        const holdings = (_b = (_a = holdingTotal[0]) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0;
        const investing = holdings + user.availableFunds;
        //const invest = buyTotal[0]?.total ?? 0 - sellTotal[0]?.total ?? 0;
        let prevReturn;
        let prevInvestingAmount = (_c = user.initFunds) !== null && _c !== void 0 ? _c : 0;
        if (returnType == 0) { // 5mins return
            prevReturn = await this.returnMinute.find({ user: user._id }).sort({ createdAt: -1 }).limit(1);
        }
        else if (returnType == 1) {
            prevReturn = await this.returnHour.find({ user: user._id }).sort({ createdAt: -1 }).limit(1);
        }
        else {
            prevReturn = await this.returnDay.find({ user: user._id }).sort({ createdAt: -1 }).limit(1);
        }
        if (prevReturn != undefined && prevReturn != null && prevReturn.length > 0) {
            prevInvestingAmount = prevReturn[0].investing;
        }
        // const invest = buyTotal[0]?.total ?? 0 - sellTotal[0]?.total ?? 0;
        const returns = Math.round((investing - prevInvestingAmount) * 100) / 100;
        const percents = Math.round((investing / prevInvestingAmount - 1) * 100 * 100) / 100;
        return { returns, percents, investing };
    }
    async getRanking(user) {
        let matchQuery = { $match: {} };
        if (user.userType == 0) {
            matchQuery = {
                $match: {
                    userType: 0
                },
            };
        }
        ;
        try {
            const ranking = await this.user.aggregate([
                matchQuery,
                {
                    $lookup: {
                        from: "holdings",
                        as: "holdings",
                        let: { user: "$_id" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$user", "$$user"] } } },
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
                                    user: 1,
                                    currentAmount: {
                                        $multiply: ["$quantity", "$stock.price", "$currencyexchange.ask"],
                                    },
                                },
                            },
                            {
                                $group: {
                                    _id: "$user",
                                    total: { $sum: "$currentAmount" },
                                },
                            }
                        ],
                    },
                },
                {
                    $unwind: {
                        path: "$holdings",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $addFields: {
                        currentInvesting: { $add: [{ $ifNull: ["$holdings.total", 0] }, "$availableFunds"] }
                    }
                },
                {
                    $addFields: {
                        oldInvesting: "$initFunds"
                    }
                },
                {
                    $addFields: {
                        returnPercent: {
                            $multiply: [
                                {
                                    $subtract: [
                                        {
                                            $divide: ["$currentInvesting", "$initFunds"]
                                        },
                                        1
                                    ]
                                },
                                100
                            ]
                        },
                    }
                },
                {
                    $sort: { returnPercent: -1 }
                },
                {
                    $setWindowFields: {
                        sortBy: { returnPercent: -1 },
                        output: {
                            ranking: {
                                $documentNumber: {}
                            }
                        }
                    }
                },
                {
                    $match: { _id: user._id },
                },
            ]);
            //console.log(ranking);
            return ranking.length > 0 ? ranking[0].ranking : -1;
        }
        catch (error) {
            throw new exceptions_1.HttpException(400, error);
        }
    }
    async getRankings(userId, professor, limit, page, skip, keyword) {
        let matchQuery = { $match: {} };
        if (keyword === "University") {
            matchQuery = {
                $match: {
                    professor: professor._id
                },
            };
        }
        ;
        if (keyword === "Funds") {
            matchQuery = {
                $match: {
                    userType: 0
                },
            };
        }
        ;
        try {
            const ranking = await this.user.aggregate([
                matchQuery,
                {
                    $lookup: {
                        from: "holdings",
                        as: "holdings",
                        let: { user: "$_id" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$user", "$$user"] } } },
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
                                    user: 1,
                                    currentAmount: {
                                        $multiply: ["$quantity", "$stock.price", "$currencyexchange.ask"],
                                    },
                                },
                            },
                            {
                                $group: {
                                    _id: "$user",
                                    total: { $sum: "$currentAmount" },
                                },
                            }
                        ],
                    },
                },
                {
                    $unwind: {
                        path: "$holdings",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $addFields: {
                        currentInvesting: { $add: [{ $ifNull: ["$holdings.total", 0] }, "$availableFunds"] }
                    }
                },
                {
                    $addFields: {
                        investing: { $arrayElemAt: ["$investings", 0] }
                    }
                },
                {
                    $unset: ["investings"]
                },
                {
                    $addFields: {
                        returnPercent: {
                            $multiply: [
                                {
                                    $subtract: [
                                        {
                                            $divide: ["$currentInvesting", "$initFunds"]
                                        },
                                        1
                                    ]
                                },
                                100
                            ]
                        },
                    }
                },
                {
                    $sort: { returnPercent: -1 }
                },
                {
                    $setWindowFields: {
                        sortBy: { returnPercent: -1 },
                        output: {
                            ranking: {
                                $documentNumber: {}
                            }
                        }
                    }
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                },
                {
                    $addFields: {
                        "id": "$_id",
                    },
                },
                {
                    $unset: ["pronoun", "education", "country", "_id"]
                }
            ]);
            return ranking;
        }
        catch (error) {
            throw new exceptions_1.HttpException(400, error);
        }
    }
    async getRankingsPerMonthYearWeek(userId, limit, page, skip, keyword) {
        try {
            const ranking = await this.user.aggregate([
                {
                    $lookup: {
                        from: "holdings",
                        as: "holdings",
                        let: { user: "$_id" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$user", "$$user"] } } },
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
                                    user: 1,
                                    currentAmount: {
                                        $multiply: ["$quantity", "$stock.price", "$currencyexchange.ask"],
                                    },
                                },
                            },
                            {
                                $group: {
                                    _id: "$user",
                                    total: { $sum: "$currentAmount" },
                                },
                            }
                        ],
                    },
                },
                {
                    $unwind: {
                        path: "$holdings",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $addFields: {
                        currentInvesting: { $add: [{ $ifNull: ["$holdings.total", 0] }, "$availableFunds"] }
                    }
                },
                keyword === "All" ?
                    {
                        $addFields: {
                            oldInvesting: 1000000
                        }
                    } :
                    {
                        $lookup: {
                            from: keyword === "1D" ? "return_minutes" : keyword === "1W" ? "return_hours" : "return_days",
                            as: "investings",
                            let: { user: "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ["$user", "$$user"] },
                                                {
                                                    $gte: [
                                                        "$createdAt",
                                                        keyword === "1D" ?
                                                            new Date(new Date().getTime() - 24 * 60 * 60 * 1000) :
                                                            keyword === "1W" ?
                                                                new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000) :
                                                                keyword === "1M" ?
                                                                    new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000) :
                                                                    new Date(new Date().getTime() - 12 * 30 * 24 * 60 * 60 * 1000)
                                                    ]
                                                },
                                                {
                                                    $lte: [
                                                        "$createdAt",
                                                        keyword === "1D" ?
                                                            new Date(new Date().getTime() - 23 * 60 * 60 * 1000) :
                                                            keyword === "1W" ?
                                                                new Date(new Date().getTime() - 6 * 24 * 60 * 60 * 1000) :
                                                                keyword === "1M" ?
                                                                    new Date(new Date().getTime() - 29 * 24 * 60 * 60 * 1000) :
                                                                    new Date(new Date().getTime() - 12 * 30 * 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000)
                                                    ]
                                                },
                                            ]
                                        }
                                    }
                                },
                                {
                                    $sort: { createdAt: 1 }
                                },
                            ],
                        },
                    },
                {
                    $addFields: {
                        investing: { $arrayElemAt: ["$investings", 0] }
                    }
                },
                {
                    $unset: ["investings"]
                },
                keyword === "All" ?
                    {
                        $addFields: {
                            oldInvesting: 1000000
                        }
                    } :
                    {
                        $unwind: {
                            path: "$investing",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                keyword === "All" ?
                    {
                        $addFields: {
                            oldInvesting: 1000000
                        }
                    } :
                    {
                        $addFields: {
                            oldInvesting: { $ifNull: ["$investing.investing", "$currentInvesting"] }
                        }
                    },
                {
                    $addFields: {
                        returnPercent: {
                            $multiply: [
                                {
                                    $subtract: [
                                        {
                                            $divide: ["$currentInvesting", "$oldInvesting"]
                                        },
                                        1
                                    ]
                                },
                                100
                            ]
                        },
                    }
                },
                {
                    $sort: { returnPercent: -1 }
                },
                {
                    $setWindowFields: {
                        sortBy: { returnPercent: -1 },
                        output: {
                            ranking: {
                                $documentNumber: {}
                            }
                        }
                    }
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                },
                {
                    $addFields: {
                        "id": "$_id",
                    },
                },
                {
                    $unset: ["pronoun", "education", "country", "_id"]
                }
            ]);
            return ranking;
        }
        catch (error) {
            throw new exceptions_1.HttpException(400, error);
        }
    }
    async createComment(userObj, stockId, content) {
        const stockData = await this.getStockById(stockId);
        if (stockData) {
            const userId = userObj._id;
            const commentItem = await this.stockComment.create({
                stock: new mongoose_1.default.Types.ObjectId(stockId),
                user: new mongoose_1.default.Types.ObjectId(userId),
                content: content,
                createdAt: moment().unix() * 1000,
            });
            return commentItem;
        }
        else {
            throw new exceptions_1.HttpException(400, "This Stock doesn't exist");
        }
    }
    async updateComment(userObj, commentId, content) {
        const userId = userObj._id;
        var currentComment = await this.getStockCommentById(commentId);
        if (currentComment.user.toString() != userId) {
            throw new exceptions_1.HttpException(400, "You are not owner of this comment");
        }
        else {
            await this.stockComment.findByIdAndUpdate(commentId, { content: content });
        }
        return "success";
    }
    async removeComment(ownerObj, commentId) {
        const userId = ownerObj._id;
        var currentComment = await this.getStockCommentById(commentId);
        if (currentComment) {
            if (currentComment.user.toString() != userId.toString()) {
                throw new exceptions_1.HttpException(400, "You are not owner of this comment");
            }
            else {
                await this.stockCommentLike.deleteMany({ stockcomment: new mongoose_1.default.Types.ObjectId(commentId) });
                await this.stockComment.findOneAndDelete({ _id: new mongoose_1.default.Types.ObjectId(commentId) });
            }
        }
        else {
            throw new exceptions_1.HttpException(400, "This comment doesn't exist");
        }
    }
    async setStockCommentLike(ownerObj, commentId, isLike) {
        const userId = ownerObj._id;
        var currentComment = await this.getStockCommentById(commentId);
        if (currentComment) {
            var userCommentLikeExist = await this.getUserCommentLikeExist(commentId, userId);
            if (userCommentLikeExist) {
                if (userCommentLikeExist.isLike == isLike) {
                    await this.stockCommentLike.findByIdAndDelete(userCommentLikeExist._id.toString());
                }
                else {
                    await this.stockCommentLike.findByIdAndUpdate(userCommentLikeExist._id.toString(), { isLike: isLike });
                }
            }
            else {
                const likeItem = await this.stockCommentLike.create({
                    stockcomment: new mongoose_1.default.Types.ObjectId(commentId),
                    user: new mongoose_1.default.Types.ObjectId(userId),
                    isLike: isLike,
                    createdAt: moment().unix() * 1000,
                });
                return "success";
            }
        }
        else {
            throw new exceptions_1.HttpException(400, "This comment doesn't exist");
        }
    }
    async getStockComments(currentUser, stockId, limit, page, skip) {
        const commentQuery = this.stockComment
            .find({ stock: new mongoose_1.default.Types.ObjectId(stockId) })
            .populate({
            path: "user",
            select: { userFullName: 1, photoUrl: 1, username: 1 },
            strictPopulate: false,
        })
            .populate("likes")
            .populate("dislikes")
            .populate({
            path: "isLiked",
            match: () => ({ user: currentUser._id, isLike: true }),
        })
            .populate({
            path: "isDisliked",
            match: () => ({ user: currentUser._id, isLike: false }),
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await this.stockComment.find().merge(commentQuery).skip(0).limit(null).countDocuments();
        const posts = await commentQuery;
        return {
            data: posts || [],
            page: Number(page),
            limit: Number(limit),
            total,
        };
    }
    async getGraphData(symbol, stockId) {
        var _a, _b, _c, _d, _e;
        const graphdata = {
            "1D": [],
            "1W": [],
            "1M": [],
            // "3M": [],
            // "6M": [],
            "1Y": [],
            "All": [],
        };
        let jsonData = {};
        let tempData = {};
        jsonData = await this.fmpService.getPriceHistory(symbol, "1D");
        tempData = jsonData.json;
        graphdata["1D"] = Array.isArray(tempData) === false ? [] : this.getDataForDateRange(tempData, 1).map((item) => {
            return Object.assign(Object.assign({}, item), { date: new Date(item.date).getTime() });
        });
        jsonData = await this.fmpService.getPriceHistory(symbol, "1W");
        tempData = jsonData.json;
        graphdata["1W"] = Array.isArray(tempData) === false ? [] : this.getDataForDateRange(tempData, 5).map((item) => {
            return Object.assign(Object.assign({}, item), { date: new Date(item.date).getTime() });
        });
        jsonData = await this.fmpService.getPriceHistory(symbol, "1M");
        tempData = jsonData.json;
        graphdata["1M"] = "historical" in tempData === false ? [] : tempData.historical.reverse().map((item) => {
            return Object.assign(Object.assign({}, item), { date: new Date(item.date).getTime() });
        });
        // tempData =  await this.fmpService.getPriceHistory(symbol, "3M");
        // data["3M"]= typeof tempData === "object" ? [] : tempData.historical.map((item: any) => {
        //   return {
        //     ...item,
        //     date: new Date(item.date).getTime(),
        //   };
        // });
        // tempData = await this.fmpService.getPriceHistory(symbol, "6M");
        // data["6M"] = typeof tempData === "object" ? [] : tempData.historical.map((item: any) => {
        //   return {
        //     ...item,
        //     date: new Date(item.date).getTime(),
        //   };
        // });
        jsonData = await this.fmpService.getPriceHistory(symbol, "1Y");
        tempData = jsonData.json;
        graphdata["1Y"] = "historical" in tempData === false ? [] : tempData.historical.reverse().map((item) => {
            return Object.assign(Object.assign({}, item), { date: new Date(item.date).getTime() });
        });
        jsonData = await this.fmpService.getPriceHistory(symbol, "All");
        tempData = jsonData.json;
        graphdata["All"] = "historical" in tempData === false ? [] : tempData.historical.reverse().map((item) => {
            return Object.assign(Object.assign({}, item), { date: new Date(item.date).getTime() });
        });
        //const stockData = await this.stock.findById(stockId);
        const stockPriceChanges = await this.fmpService.getStockPriceChange(symbol);
        const stockCurrentPriceItem = await this.fmpService.getStockCurrentPrice(symbol);
        const returndata = {
            "1D": {},
            "1W": {},
            "1M": {},
            "1Y": {},
            "All": {},
        };
        let currentPrice = stockCurrentPriceItem["price"];
        let percent = (_a = stockPriceChanges["1D"]) !== null && _a !== void 0 ? _a : 0;
        let price = currentPrice - (currentPrice / (1 + percent / 100));
        let startTime = new Date().getTime();
        returndata["1D"] = { price, percent, startTime };
        percent = (_b = stockPriceChanges["5D"]) !== null && _b !== void 0 ? _b : 0;
        price = currentPrice - (currentPrice / (1 + percent / 100));
        returndata["1W"] = { price, percent, startTime };
        percent = (_c = stockPriceChanges["1M"]) !== null && _c !== void 0 ? _c : 0;
        price = currentPrice - (currentPrice / (1 + percent / 100));
        returndata["1M"] = { price, percent, startTime };
        percent = (_d = stockPriceChanges["1Y"]) !== null && _d !== void 0 ? _d : 0;
        price = currentPrice - (currentPrice / (1 + percent / 100));
        returndata["1Y"] = { price, percent, startTime };
        percent = (_e = stockPriceChanges["max"]) !== null && _e !== void 0 ? _e : 0;
        price = currentPrice - (currentPrice / (1 + percent / 100));
        returndata["All"] = { price, percent, startTime };
        return { returndata, graphdata, currentPrice };
    }
    async getGraphDataPerRange(symbol, stockId, range) {
        var _a, _b, _c, _d, _e;
        let graphdata;
        let tempData = {};
        tempData = await this.fmpService.getPriceHistory(symbol, range);
        if (range === "1D" || range === "1W") {
            let rangeNumber = 1;
            if (range === "1W")
                rangeNumber = 5;
            graphdata = Array.isArray(tempData.json) === false ? [] : this.getDataForDateRange(tempData.json, rangeNumber).map((item) => {
                return Object.assign({}, item);
            });
        }
        else {
            graphdata = "historical" in tempData.json === false ? [] : tempData.json.historical.reverse().map((item) => {
                return Object.assign({}, item);
            });
        }
        const stockPriceChanges = await this.fmpService.getStockPriceChange(symbol);
        const stockCurrentPriceItem = await this.fmpService.getStockCurrentPrice(symbol);
        let currentPrice = stockCurrentPriceItem["price"];
        let percent = (_a = stockPriceChanges["1D"]) !== null && _a !== void 0 ? _a : 0;
        if (range === "1W") {
            percent = (_b = stockPriceChanges["5D"]) !== null && _b !== void 0 ? _b : 0;
        }
        if (range === "1M") {
            percent = (_c = stockPriceChanges["1M"]) !== null && _c !== void 0 ? _c : 0;
        }
        if (range === "1Y") {
            percent = (_d = stockPriceChanges["1Y"]) !== null && _d !== void 0 ? _d : 0;
        }
        if (range === "All") {
            percent = (_e = stockPriceChanges["max"]) !== null && _e !== void 0 ? _e : 0;
        }
        let price = currentPrice - (currentPrice / (1 + percent / 100));
        let startTime = new Date().getTime();
        let returndata = { price, percent, startTime };
        return { returndata, graphdata, currentPrice };
    }
    getDataForDateRange(data, length) {
        let total = 1;
        let tempDate = "";
        const result = data.filter((temp, index) => {
            if (index === 0) {
                tempDate = data[0].date.split(" ")[0];
            }
            if (!temp.date.includes(tempDate)) {
                tempDate = data[index].date.split(" ")[0];
                total++;
            }
            if (total > length) {
                return false;
            }
            return temp.date.includes(tempDate);
        });
        const reversed = result.reverse();
        return reversed;
    }
    async getTopRank() {
        const returns = await this.returnMinute.aggregate([
            {
                $sort: {
                    createdAt: 1,
                },
            },
            {
                $group: {
                    _id: "$user",
                    latest: { $last: "$createdAt" },
                    returns: { $last: "$returns" },
                    percents: { $last: "$percents" },
                },
            },
            {
                $sort: {
                    percents: -1,
                },
            },
            {
                $limit: 10,
            },
        ]);
        return returns;
    }
    async getTopWinners() {
        try {
            let stocks = [];
            const { data } = await axios_1.default.get(`${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/stock_market/gainers?apikey=${config_1.Env.FMP_API_KEY}`);
            await Promise.all(data.map(async (oneWinnder) => {
                const stockData = await this.stock.findOne({ symbol: oneWinnder.symbol });
                if (stockData) {
                    stockData.changesPercentage = oneWinnder.changesPercentage;
                    stockData.change = oneWinnder.change;
                    stockData.price = oneWinnder.price;
                    stocks.push(stockData);
                }
            }));
            stocks.sort((a, b) => b.changesPercentage - a.changesPercentage);
            return {
                data: stocks || [],
            };
        }
        catch (error) {
            throw new exceptions_1.HttpException(400, "some error");
        }
    }
    async getTopLosers() {
        try {
            let stocks = [];
            const { data } = await axios_1.default.get(`${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/stock_market/losers?apikey=${config_1.Env.FMP_API_KEY}`);
            await Promise.all(data.map(async (oneWinnder) => {
                const stockData = await this.stock.findOne({ symbol: oneWinnder.symbol });
                if (stockData) {
                    stockData.changesPercentage = oneWinnder.changesPercentage;
                    stockData.change = oneWinnder.change;
                    stockData.price = oneWinnder.price;
                    stocks.push(stockData);
                }
            }));
            stocks.sort((a, b) => a.changesPercentage - b.changesPercentage);
            return {
                data: stocks || [],
            };
        }
        catch (error) {
            throw new exceptions_1.HttpException(400, "some error");
        }
    }
    async getStockDetail(symbol, method, stockSector, stockIndustry) {
        let url = ``;
        switch (method) {
            case 'MarketCapticalization':
                url = `${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/market-capitalization/${symbol}?limit=5&apikey=${config_1.Env.FMP_API_KEY}`;
                break;
            case 'FinancialStatements':
                url = `${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/income-statement/${symbol}?limit=5&apikey=${config_1.Env.FMP_API_KEY}`;
                break;
            case 'FinancialRatios':
                url = `${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/ratios-ttm/${symbol}?apikey=${config_1.Env.FMP_API_KEY}`;
                break;
            case 'FinancialScores':
                url = `${config_1.FMP_CONFIG.API_BASE_URL}/api/v4/score?symbol=${symbol}&apikey=${config_1.Env.FMP_API_KEY}`;
                break;
            case 'EnterpriseValue':
                url = `${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/enterprise-values/${symbol}?apikey=${config_1.Env.FMP_API_KEY}`;
                break;
            case 'FinancialStatementGrowth':
                url = `${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/income-statement-growth/${symbol}?limit=10&apikey=${config_1.Env.FMP_API_KEY}`;
                break;
            case 'KeyMetris':
                url = `${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/key-metrics-ttm/${symbol}?limit=10&apikey=${config_1.Env.FMP_API_KEY}`;
                break;
            case 'FinancialGrowth':
                url = `${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/financial-growth/${symbol}?limit=10&apikey=${config_1.Env.FMP_API_KEY}`;
                break;
            case 'DCF':
                url = `${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/discounted-cash-flow/${symbol}?apikey=${config_1.Env.FMP_API_KEY}`;
                break;
            case 'SectorPeRatio':
                url = `${config_1.FMP_CONFIG.API_BASE_URL}/api/v4/sector_price_earning_ratio?date=2021-05-07&exchange=NYSE&apikey=${config_1.Env.FMP_API_KEY}`;
                break;
            case 'IndustryPeRatio':
                url = `${config_1.FMP_CONFIG.API_BASE_URL}/api/v4/industry_price_earning_ratio?date=2021-05-07&exchange=NYSE&apikey=${config_1.Env.FMP_API_KEY}`;
                break;
            case 'SectorPerformance':
                url = `${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/sector-performance?apikey=${config_1.Env.FMP_API_KEY}`;
                break;
            default:
                url = `${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/income-statement/${symbol}?limit=5&apikey=${config_1.Env.FMP_API_KEY}`;
        }
        try {
            const { data } = await axios_1.default.get(url);
            let data1 = data[0];
            if (method === 'SectorPerformance') {
                if (stockSector == "Technology")
                    stockSector = "Information Technology";
                data1 = data.find((obj) => {
                    return obj.sector === stockSector;
                });
                const changePercentage = data1["changesPercentage"].substring(0, data1["changesPercentage"].length - 1);
                if (this.isNumeric(changePercentage)) {
                    data1["changesPercentage"] = this.changeNumberformat(parseFloat(changePercentage), 2);
                }
            }
            else {
                var keys = Object.keys(data1);
                for (var i = 0; i < keys.length; i++) {
                    if (typeof data1[keys[i]] === 'number' || typeof data1[keys[i]] === "object") {
                        data1[keys[i]] = this.changeNumberformat(data1[keys[i]], 2);
                    }
                }
            }
            return data1;
        }
        catch (error) {
            throw new exceptions_1.HttpException(400, error);
        }
    }
    async getRatios(symbol, method, stockSector, stockIndustry) {
        let url = ``;
        let currentDate = new Date();
        let apiDate;
        try {
            let data;
            let i = 0;
            do {
                currentDate = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
                apiDate = currentDate.toISOString().split("T")[0];
                switch (method) {
                    case 'SectorPeRatio':
                        url = `${config_1.FMP_CONFIG.API_BASE_URL}/api/v4/sector_price_earning_ratio?date=${apiDate}&exchange=NYSE&apikey=${config_1.Env.FMP_API_KEY}`;
                        break;
                    case 'IndustryPeRatio':
                        url = `${config_1.FMP_CONFIG.API_BASE_URL}/api/v4/industry_price_earning_ratio?date=${apiDate}&exchange=NYSE&apikey=${config_1.Env.FMP_API_KEY}`;
                        break;
                    default:
                        url = `${config_1.FMP_CONFIG.API_BASE_URL}/api/v4/sector_price_earning_ratio?date=${apiDate}&exchange=NYSE&apikey=${config_1.Env.FMP_API_KEY}`;
                }
                data = await this.getRatiosData(stockSector, stockIndustry, url);
                i++;
            } while (data == undefined || data == null || data.length == 0);
            let data1 = data[0];
            if (method === 'SectorPeRatio') {
                data1 = data.find((obj) => {
                    return obj.sector === stockSector;
                });
            }
            else if (method === 'IndustryPeRatio') {
                data1 = data.find((obj) => {
                    return obj.industry === stockIndustry;
                });
            }
            var keys = Object.keys(data1);
            for (var i1 = 0; i1 < keys.length; i1++) {
                if (typeof data1[keys[i1]] === 'number' || typeof data1[keys[i]] === "object" || !isNaN(data1[keys[i1]])) {
                    data1[keys[i1]] = this.changeNumberformat(data1[keys[i1]], 2);
                }
            }
            return data1;
        }
        catch (error) {
            throw new exceptions_1.HttpException(400, error);
        }
    }
    async getRatiosData(stockSector, stockIndustry, url) {
        try {
            const { data } = await axios_1.default.get(url);
            return data;
        }
        catch (error) {
            //throw new HttpException(400, error);
            return [];
        }
    }
    async getSectorMarketPerformance(stockSector) {
        try {
            const peData = await this.getRatios("", "SectorPeRatio", stockSector, "");
            if (stockSector == "Technology")
                stockSector = "Information Technology";
            const { data } = await axios_1.default.get(`${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/sector-performance?apikey=${config_1.Env.FMP_API_KEY}`);
            let data1 = data.find((obj) => {
                return obj.sector === stockSector;
            });
            if (data1) {
                const changePercentage = data1["changesPercentage"].substring(0, data1["changesPercentage"].length - 1);
                if (this.isNumeric(changePercentage)) {
                    peData["changesPercentage"] = await this.changeNumberformat(parseFloat(changePercentage), 2);
                    return peData;
                }
                else {
                    return peData;
                }
            }
            else {
                return peData;
            }
        }
        catch (error) {
            throw new exceptions_1.HttpException(400, error);
        }
    }
    isNumeric(x) {
        return parseFloat(x).toString() === x.toString();
    }
    changeNumberformat(num, digits) {
        const lookup = [
            { value: 1, symbol: "" },
            { value: 1e3, symbol: "k" },
            { value: 1e6, symbol: "M" },
            { value: 1e9, symbol: "B" },
            { value: 1e12, symbol: "T" },
            { value: 1e15, symbol: "P" },
            { value: 1e18, symbol: "E" }
        ];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        var item = lookup.slice().reverse().find(function (item) {
            return Math.abs(num) >= item.value;
        });
        if (item) {
            return (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol;
        }
        else {
            if (this.isNumeric(num)) {
                if (typeof num === "number") {
                    return num.toFixed(2);
                }
                else if (typeof num === "string") {
                    return parseFloat(num).toFixed(2);
                }
                else if (typeof num === "object") {
                    return Number(num).toFixed(2);
                }
                else {
                    return num;
                }
            }
            else {
                return num;
            }
        }
    }
}
exports.StockService = StockService;
StockService._sharedInstance = null;
//# sourceMappingURL=stock.service.js.map