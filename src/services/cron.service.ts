import moment = require("moment");
import * as cron from "node-cron";
import { User } from "_app/interfaces";
import { rankModel, returnDayModel, returnHourModel, returnMinuteModel, userModel } from "_app/models";
import { FmpService } from "./fmp.service";
import { ReturnService } from "./return.service";
import { StockService } from "./stock.service";

export class CronService {
  public fmpService = new FmpService();
  public stockService = new StockService();
  public returnService = new ReturnService();
  public user = userModel;
  public returnMinute = returnMinuteModel;
  public returnHour = returnHourModel;
  public returnDay = returnDayModel;
  public rank = rankModel;

  static _sharedInstance: CronService = null;

  static getInstance() {
    if (!CronService._sharedInstance) {
      CronService._sharedInstance = new CronService();
    }
    return CronService._sharedInstance;
  }

  public async runJobs() {
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
