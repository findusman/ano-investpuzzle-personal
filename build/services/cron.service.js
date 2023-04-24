"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronService = void 0;
const cron = require("node-cron");
const models_1 = require("_app/models");
const fmp_service_1 = require("./fmp.service");
const return_service_1 = require("./return.service");
const stock_service_1 = require("./stock.service");
class CronService {
    constructor() {
        this.fmpService = new fmp_service_1.FmpService();
        this.stockService = new stock_service_1.StockService();
        this.returnService = new return_service_1.ReturnService();
        this.user = models_1.userModel;
        this.returnMinute = models_1.returnMinuteModel;
        this.returnHour = models_1.returnHourModel;
        this.returnDay = models_1.returnDayModel;
        this.rank = models_1.rankModel;
    }
    static getInstance() {
        if (!CronService._sharedInstance) {
            CronService._sharedInstance = new CronService();
        }
        return CronService._sharedInstance;
    }
    async runJobs() {
        // update stock price every minute
        cron.schedule("* * * * *", () => {
            this.fmpService.updateStockPrices();
        });
        // update stock detail every day
        cron.schedule("0 0 * * *", () => {
            this.fmpService.updateCompanyProfile();
        });
        // calculate return every 5 mins
        cron.schedule("*/5 * * * *", () => {
            this.returnService.calculateReturn5Min();
        });
        // calculate return every hour
        cron.schedule("0 * * * *", () => {
            this.returnService.calculateReturn1Hour();
        });
        // calculate return every day
        cron.schedule("0 0 * * *", () => {
            this.returnService.calculateReturn1Day();
        });
        // calculate return rank every day
        cron.schedule("12 0 * * *", () => {
            this.returnService.calculateReturnRank();
        });
    }
}
exports.CronService = CronService;
CronService._sharedInstance = null;
//# sourceMappingURL=cron.service.js.map