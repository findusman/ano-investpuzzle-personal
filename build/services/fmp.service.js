"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FmpService = void 0;
const models_1 = require("_app/models");
const fetch = require("node-fetch");
const https = require('https');
const axios_1 = require("axios");
const config_1 = require("_app/config");
const socket_1 = require("_app/socket");
const delay = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
// Financial Modeling Prep
class FmpService {
    constructor() {
        this.stock = models_1.stockModel;
        this.currenyExchange = models_1.currencyexchangeModel;
    }
    static getInstance() {
        if (!FmpService._sharedInstance) {
            FmpService._sharedInstance = new FmpService();
        }
        return FmpService._sharedInstance;
    }
    async updateStockPrices() {
        try {
            const { data } = await axios_1.default.get(`${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/quotes/nasdaq?apikey=${config_1.Env.FMP_API_KEY}`);
            await Promise.all(data.map(async (stock) => {
                await this.stock.findOneAndUpdate({ symbol: stock.symbol }, stock, { upsert: true });
            }));
            (0, socket_1.getSocketConnection)().sendEvent("data", "stock-prices", data);
        }
        catch (error) {
            console.log(error);
        }
    }
    async updateCompanyProfile() {
        try {
            const stocks = await this.stock.find();
            await Promise.all(stocks.map(async (stock, index) => {
                const companyProfile = await this.getCompanyProfile(stock.symbol);
                if (companyProfile) {
                    await this.stock.findByIdAndUpdate(stock._id, companyProfile);
                }
            }));
        }
        catch (error) {
            console.log(error);
        }
    }
    async getCompanyProfile(symbol) {
        const { data } = await axios_1.default.get(`${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/profile/${symbol}?apikey=${config_1.Env.FMP_API_KEY}`);
        return data[0];
    }
    async getReturnHistoryOfSP500(from, to) {
        const symbol = "^GSPC";
        const { data } = await axios_1.default.get(`${config_1.FMP_CONFIG.API_BASE_URL}/api//v3/historical-price-full/${symbol}?from=${from}&to=${to}&apikey=${config_1.Env.FMP_API_KEY}`);
        return data["historical"];
    }
    async getPriceHistory(symbol, option) {
        let options;
        let to;
        let from;
        let currentDate;
        switch (option) {
            case "1D":
                options = {
                    baseURL: `${config_1.FMP_CONFIG.API_BASE_URL}`,
                    url: `/api/v3/historical-chart/5min/${symbol}`,
                    params: {
                        apikey: `${config_1.Env.FMP_API_KEY}`,
                    },
                    method: "GET",
                    responseType: "stream",
                    timeout: 60000,
                    httpsAgent: new https.Agent({ keepAlive: true })
                };
                break;
            case "1W":
                options = {
                    baseURL: `${config_1.FMP_CONFIG.API_BASE_URL}`,
                    url: `/api/v3/historical-chart/30min/${symbol}`,
                    params: {
                        apikey: `${config_1.Env.FMP_API_KEY}`,
                    },
                    method: "GET",
                    responseType: "stream",
                    timeout: 60000,
                    httpsAgent: new https.Agent({ keepAlive: true })
                };
                break;
            case "1M":
                currentDate = new Date();
                let oneMonthFromNow = new Date();
                oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() - 1);
                from = oneMonthFromNow.toISOString().split("T")[0];
                to = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                options = {
                    baseURL: `${config_1.FMP_CONFIG.API_BASE_URL}`,
                    url: `/api/v3/historical-price-full/${symbol}`,
                    params: {
                        apikey: `${config_1.Env.FMP_API_KEY}`,
                        from: from,
                        to: to,
                    },
                    method: "GET",
                    responseType: "stream",
                    timeout: 60000,
                    httpsAgent: new https.Agent({ keepAlive: true })
                };
                break;
            case "3M":
                to = new Date();
                from = new Date(to.getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
                options = {
                    baseURL: `${config_1.FMP_CONFIG.API_BASE_URL}`,
                    url: `/api/v3/historical-price-full/${symbol}`,
                    params: {
                        apikey: `${config_1.Env.FMP_API_KEY}`,
                        from: from.toISOString().split("T")[0],
                        to: to.toISOString().split("T")[0],
                    },
                    method: "GET",
                    responseType: "stream",
                    timeout: 60000,
                    httpsAgent: new https.Agent({ keepAlive: true })
                };
                break;
            case "6M":
                to = new Date();
                from = new Date(to.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
                options = {
                    baseURL: `${config_1.FMP_CONFIG.API_BASE_URL}`,
                    url: `/api/v3/historical-price-full/${symbol}`,
                    params: {
                        apikey: `${config_1.Env.FMP_API_KEY}`,
                        from: from.toISOString().split("T")[0],
                        to: to.toISOString().split("T")[0],
                    },
                    method: "GET",
                    responseType: "stream",
                    timeout: 60000,
                    httpsAgent: new https.Agent({ keepAlive: true })
                };
                break;
            case "1Y":
                currentDate = new Date();
                let oneYearFromNow = new Date();
                oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() - 1);
                from = oneYearFromNow.toISOString().split("T")[0];
                to = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                options = {
                    baseURL: `${config_1.FMP_CONFIG.API_BASE_URL}`,
                    url: `/api/v3/historical-price-full/${symbol}`,
                    params: {
                        apikey: `${config_1.Env.FMP_API_KEY}`,
                        from: from,
                        to: to,
                    },
                    method: "GET",
                    responseType: "stream",
                    timeout: 60000,
                    httpsAgent: new https.Agent({ keepAlive: true })
                };
                break;
            case "All":
                options = {
                    baseURL: `${config_1.FMP_CONFIG.API_BASE_URL}`,
                    url: `/api/v3/historical-price-full/${symbol}`,
                    params: {
                        apikey: `${config_1.Env.FMP_API_KEY}`,
                        from: "1980-01-01",
                    },
                    method: "GET",
                    responseType: "stream",
                    timeout: 60000,
                    httpsAgent: new https.Agent({ keepAlive: true })
                };
                break;
        }
        const data = await this.getDataForBuffer(options);
        return data;
    }
    async getDataForBuffer(options) {
        return await new Promise(async (resolve, reject) => {
            let response;
            const { data } = await (0, axios_1.default)(options);
            await data.on('data', async (data) => {
                response = response ? response += data : data;
            });
            await data.on('error', async (error) => {
                reject({ error: error.message });
            });
            await data.on('end', async () => {
                const json = JSON.parse(response.toString());
                resolve({ json });
            });
        });
    }
    async getRiskFreeRate() {
        let today = new Date();
        let todayDate = today.toISOString().split("T")[0];
        const { data } = await axios_1.default.get(`${config_1.FMP_CONFIG.API_BASE_URL}/api/v4/treasury?to=${todayDate}&apikey=${config_1.Env.FMP_API_KEY}`);
        return data[0].month3;
    }
    async getStockCurrencyExchangeRate(currency) {
        if (currency.toUpperCase() == "USD") {
            return 1;
        }
        else {
            let data = await this.currenyExchange.findOne({ currency: currency });
            if (data) {
                return data.ask;
            }
            else {
                return 0;
            }
        }
    }
    async getStockPriceChange(symbol) {
        try {
            const { data } = await axios_1.default.get(`${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/stock-price-change/${symbol}?apikey=${config_1.Env.FMP_API_KEY}`);
            return data[0];
        }
        catch (error) {
            console.log(error);
        }
    }
    async getStockCurrentPrice(symbol) {
        try {
            const { data } = await axios_1.default.get(`${config_1.FMP_CONFIG.API_BASE_URL}/api/v3/quote-short/${symbol}?apikey=${config_1.Env.FMP_API_KEY}`);
            return data[0];
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.FmpService = FmpService;
FmpService._sharedInstance = null;
//# sourceMappingURL=fmp.service.js.map