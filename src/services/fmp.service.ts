import moment = require("moment");
import { stockModel, stockFollowModel, currencyexchangeModel } from "_app/models";
const fetch = require("node-fetch");
const https = require('https');

import axios from "axios";
import { FMP_CONFIG, Env } from "_app/config";
import { getSocketConnection } from "_app/socket";
import { Stock } from "_app/interfaces";

const delay = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// Financial Modeling Prep
export class FmpService {
  public stock = stockModel;
  public currenyExchange = currencyexchangeModel;

  static _sharedInstance: FmpService = null;

  static getInstance() {
    if (!FmpService._sharedInstance) {
      FmpService._sharedInstance = new FmpService();
    }
    return FmpService._sharedInstance;
  }

  public async updateStockPrices() {
    try {
      const { data }: any = await axios.get(
        `${FMP_CONFIG.API_BASE_URL}/api/v3/quotes/nasdaq?apikey=${Env.FMP_API_KEY}`
      );
      await Promise.all(
        data.map(async (stock: any) => {
          await this.stock.findOneAndUpdate({ symbol: stock.symbol }, stock, { upsert: true });
        })
      );
      getSocketConnection().sendEvent("data", "stock-prices", data);
    } catch (error) {
      console.log(error);
    }
  }

  public async updateCompanyProfile() {
    try {
      const stocks = await this.stock.find();
      await Promise.all(
        stocks.map(async (stock: Stock, index: number) => {
          const companyProfile = await this.getCompanyProfile(stock.symbol);
          if (companyProfile) {
            await this.stock.findByIdAndUpdate(stock._id, companyProfile);
          }
        })
      );
    } catch (error) {
      console.log(error);
    }
  }

  private async getCompanyProfile(symbol: string) {
    const { data }: any = await axios.get(
      `${FMP_CONFIG.API_BASE_URL}/api/v3/profile/${symbol}?apikey=${Env.FMP_API_KEY}`
    );
    return data[0];
  }

  public async getReturnHistoryOfSP500(from: string, to: string) {
    const symbol = "^GSPC";
    const { data }: any = await axios.get(
      `${FMP_CONFIG.API_BASE_URL}/api//v3/historical-price-full/${symbol}?from=${from}&to=${to}&apikey=${Env.FMP_API_KEY}`
    );
    return data["historical"];
  }

  public async getPriceHistory(symbol: string, option: string) {
    let options;
    let to;
    let from;
    let currentDate;
    switch (option) {
      case "1D":
        options = {
          baseURL: `${FMP_CONFIG.API_BASE_URL}`,
          url: `/api/v3/historical-chart/5min/${symbol}`,
          params: {
            apikey: `${Env.FMP_API_KEY}`,
          },
          method: "GET",
          responseType: "stream",
          timeout: 60000,
          httpsAgent: new https.Agent({ keepAlive: true })
        }
        break;
      case "1W":
        options = {
          baseURL: `${FMP_CONFIG.API_BASE_URL}`,
          url: `/api/v3/historical-chart/30min/${symbol}`,
          params: {
            apikey: `${Env.FMP_API_KEY}`,
          },
          method: "GET",
          responseType: "stream",
          timeout: 60000,
          httpsAgent: new https.Agent({ keepAlive: true })
        }
        break;
      case "1M":
        currentDate = new Date();
        let oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() - 1);
        from = oneMonthFromNow.toISOString().split("T")[0];
        to = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        options = {
          baseURL: `${FMP_CONFIG.API_BASE_URL}`,
          url: `/api/v3/historical-price-full/${symbol}`,
          params: {
            apikey: `${Env.FMP_API_KEY}`,
            from: from,
            to: to,
          },
          method: "GET",
          responseType: "stream",
          timeout: 60000,
          httpsAgent: new https.Agent({ keepAlive: true })
        }
        break;
      case "3M":
        to = new Date();
        from = new Date(to.getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
        options = {
          baseURL: `${FMP_CONFIG.API_BASE_URL}`,
          url: `/api/v3/historical-price-full/${symbol}`,
          params: {
            apikey: `${Env.FMP_API_KEY}`,
            from: from.toISOString().split("T")[0],
            to: to.toISOString().split("T")[0],
          },
          method: "GET",
          responseType: "stream",
          timeout: 60000,
          httpsAgent: new https.Agent({ keepAlive: true })
        }
        break;
      case "6M":
        to = new Date();
        from = new Date(to.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
        options = {
          baseURL: `${FMP_CONFIG.API_BASE_URL}`,
          url: `/api/v3/historical-price-full/${symbol}`,
          params: {
            apikey: `${Env.FMP_API_KEY}`,
            from: from.toISOString().split("T")[0],
            to: to.toISOString().split("T")[0],
          },
          method: "GET",
          responseType: "stream",
          timeout: 60000,
          httpsAgent: new https.Agent({ keepAlive: true })
        }
        break;
      case "1Y":
        currentDate = new Date();
        let oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() - 1);
        from = oneYearFromNow.toISOString().split("T")[0];
        to = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        options = {
          baseURL: `${FMP_CONFIG.API_BASE_URL}`,
          url: `/api/v3/historical-price-full/${symbol}`,
          params: {
            apikey: `${Env.FMP_API_KEY}`,
            from: from,
            to: to,
          },
          method: "GET",
          responseType: "stream",
          timeout: 60000,
          httpsAgent: new https.Agent({ keepAlive: true })
        }
        break;
      case "All":
        options = {
          baseURL: `${FMP_CONFIG.API_BASE_URL}`,
          url: `/api/v3/historical-price-full/${symbol}`,
          params: {
            apikey: `${Env.FMP_API_KEY}`,
            from: "1980-01-01",
          },
          method: "GET",
          responseType: "stream",
          timeout: 60000,
          httpsAgent: new https.Agent({ keepAlive: true })
        }
        break;
    }
    const data = await this.getDataForBuffer(options);
    return data;
  }

  private async getDataForBuffer(options: Object) {
    return await new Promise(async (resolve, reject) => {
      let response: any;
      const { data }: any = await axios(options);
      await data.on('data', async (data: any) => {
        response = response ? response += data : data;
      });

      await data.on('error', async (error: any) => {
        reject({ error: error.message })
      })

      await data.on('end', async () => {
        const json = JSON.parse(response.toString());
        resolve({ json });
      });
    })
  }

  public async getRiskFreeRate() {
    let today = new Date();
    let todayDate = today.toISOString().split("T")[0];
    const { data }: any = await axios.get(
      `${FMP_CONFIG.API_BASE_URL}/api/v4/treasury?to=${todayDate}&apikey=${Env.FMP_API_KEY}`
    );
    return data[0].month3;
  }

  public async getStockCurrencyExchangeRate(currency: string) {
    if (currency.toUpperCase() == "USD") {
      return 1;
    } else {
      let data = await this.currenyExchange.findOne({ currency: currency });
      if (data) {
        return data.ask;
      } else {
        return 0;
      }
    }
  }

  public async getStockPriceChange(symbol: string) {
    try {
      const { data }: any = await axios.get(
        `${FMP_CONFIG.API_BASE_URL}/api/v3/stock-price-change/${symbol}?apikey=${Env.FMP_API_KEY}`
      );
      return data[0];
    } catch (error) {
      console.log(error);
    }
  }

  public async getStockCurrentPrice(symbol: string) {
    try {
      const { data }: any = await axios.get(
        `${FMP_CONFIG.API_BASE_URL}/api/v3/quote-short/${symbol}?apikey=${Env.FMP_API_KEY}`
      );
      return data[0];
    } catch (error) {
      console.log(error);
    }
  }
}
