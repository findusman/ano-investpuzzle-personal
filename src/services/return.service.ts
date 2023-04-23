import { User, Rank } from "_app/interfaces";
import {
  badgeModel,
  rankModel,
  returnDayModel,
  returnHourModel,
  returnMinuteModel,
  userBadgeModel,
  userModel,
} from "_app/models";
import { FmpService } from "./fmp.service";
import { StockService } from "./stock.service";
import { NotificationService } from "./notification.service";

export class ReturnService {
  public fmpService = new FmpService();
  public stockService = new StockService();
  public notificationService = new NotificationService();
  public user = userModel;
  public returnMinute = returnMinuteModel;
  public returnHour = returnHourModel;
  public returnDay = returnDayModel;
  public rank = rankModel;
  public badge = badgeModel;
  public userBadge = userBadgeModel;

  static _sharedInstance: ReturnService = null;

  static getInstance() {
    if (!ReturnService._sharedInstance) {
      ReturnService._sharedInstance = new ReturnService();
    }
    return ReturnService._sharedInstance;
  }

  public async calculateReturn5Min() {
    try {
      const users = await this.user.find();
      await Promise.all(
        users.map(async (user: User) => {
          const returns = await this.stockService.getReturn(user, 0);
          await this.returnMinute.create({
            user: user._id,
            returns: !Number.isNaN(returns.returns) ? returns.returns : 0,
            percents: !Number.isNaN(returns.percents) ? returns.percents : 0,
            investing: !Number.isNaN(returns.investing) ? returns.investing : 0,
          });
        })
      );
    } catch (error) {
      console.log(error);
    }
  }

  public async calculateReturn1Hour() {
    try {
      const users = await this.user.find();
      await Promise.all(
        users.map(async (user: User) => {
          const returns = await this.stockService.getReturn(user, 1);
          await this.returnHour.create({
            user: user._id,
            returns: !Number.isNaN(returns.returns) ? returns.returns : 0,
            percents: !Number.isNaN(returns.percents) ? returns.percents : 0,
            investing: !Number.isNaN(returns.investing) ? returns.investing : 0,
          });
        })
      );
    } catch (error) {
      console.log(error);
    }
  }

  public async calculateReturn1Day() {
    try {
      const users = await this.user.find();
      await Promise.all(
        users.map(async (user: User) => {
          const returns = await this.stockService.getReturn(user, 2);
          await this.returnDay.create({
            user: user._id,
            returns: !Number.isNaN(returns.returns) ? returns.returns : 0,
            percents: !Number.isNaN(returns.percents) ? returns.percents : 0,
            investing: !Number.isNaN(returns.investing) ? returns.investing : 0,
          });
        })
      );
    } catch (error) {
      console.log(error);
    }
  }

  public async calculateReturnRank() {
    try {
      const users = await this.stockService.getTopRank();
      const ids = users.map(user => user._id);
      await this.rank.create(ids);
      this.checkBadges();
    } catch (error) {
      console.log(error);
    }
  }

  private async checkBadges() {
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
        await Promise.all(records.map(async (record: any) => {
          if (record.count === badges[i].number) {
            const data = {
              user: record._id,
              badge: badges[i]._id,
            };
            const badge = await this.userBadge.findOneAndUpdate(data, data, { upsert: true }); /// after upsert : , new:true;
            await this.notificationService.createNotification(
              record._id.toString(),
              record._id.toString(),
              7,
              badges[i]._id,
              "Congratulation! You earned a new badge",
              1
            );
          }
        }));
        i++;
      } while (i < badges.length);
    } catch (error) {
      console.log(error);
    }
  }

  public async getReturnGraphData(user: User) {
    const returns: {
      "1D": any[];
      "1W": any[];
      "1M": any[];
      "1Y": any[];
      All: any[];
    } = {
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

  private async getReturnBetweenDuration(user: User, option: string) {
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
      const returnPercent = (currentReturns.investing / oldInvesting - 1) * 100
      return { returnValue, returnPercent };
    } catch (error) {
      console.log(error);
      const returnValue = 0;
      const returnPercent = 0;
      return { returnValue, returnPercent };
    }
  }

  private async getReturnHistory(user: User, option: string) {
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
      data = await Promise.all(
        data.map(async (item: any) => {
          return {
            ...item._doc,
            createdAt: new Date(item.createdAt).getTime(),
          };
        })
      );
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}
