"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const models_1 = require("_app/models");
const config_1 = require("_app/config");
const exceptions_1 = require("_app/exceptions");
const axios_1 = require("axios");
class NewsService {
    constructor() {
        this.user = models_1.userModel;
    }
    static getInstance() {
        if (!NewsService._sharedInstance) {
            NewsService._sharedInstance = new NewsService();
        }
        return NewsService._sharedInstance;
    }
    async getIpos(myId) {
        try {
            var date = new Date();
            date.setDate(date.getDate() + 30);
            var endDate = date.toISOString().split('T')[0]; // "2016-06-08"
            var date = new Date();
            date.setDate(date.getDate() - 60);
            var startDate = date.toISOString().split('T')[0]; // "2016-06-08"
            // const { data }: any = await axios.get(
            //   `${FMP_CONFIG.API_BASE_URL}/api/v3/ipo_calendar?from=${startDate}&to=${endDate}&apikey=${Env.FMP_API_KEY}`
            // );
            const { data } = await axios_1.default.get(`${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/ipo_calendar?from=${startDate}&to=${endDate}&apikey=${config_1.Env.FMP_API_KEY}`);
            return data;
        }
        catch (error) {
            throw new exceptions_1.HttpException(400, error);
        }
    }
    async getMarketNews(limit, page, skip) {
        try {
            // const { data }: any = await axios.get(
            //   `https://stocknewsapi.com/api/v1/category?section=general&items=${limit}&page=${page}&token=${Env.STOCK_NEWS_API_KEY}`
            // );
            const stockNews = await this.getStockNews();
            const generalNews = await this.getGeneralNews();
            const data = await stockNews.concat(generalNews);
            data.sort((a, b) => {
                if (a.publishedDate < b.publishedDate) {
                    return 1;
                }
                if (a.publishedDate > b.publishedDate) {
                    return -1;
                }
                return 0;
            });
            return data;
        }
        catch (error) {
            throw new exceptions_1.HttpException(400, error);
        }
    }
    async getStockNews() {
        const { data } = await axios_1.default.get(`${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/stock_news?limit=100&apikey=${config_1.Env.FMP_API_KEY}`);
        return data;
    }
    async getGeneralNews() {
        const { data } = await axios_1.default.get(`${config_1.FMP_CONFIG.API_BASE_URL}/api/v4/general_news?page=0&apikey=${config_1.Env.FMP_API_KEY}`);
        return data;
    }
}
exports.NewsService = NewsService;
NewsService._sharedInstance = null;
//# sourceMappingURL=news.service.js.map