import * as Papa from "papaparse";
import moment = require("moment");

import { userModel } from "_app/models";

import { } from "_app/dtos";
import { Env, FMP_CONFIG } from "_app/config";
import * as handlebars from "handlebars";
import mongoose from "mongoose";
import {
  AlreadyExistsException,
  HttpException,
  NotAuthorizedException,
  NotFoundException,
  UserAlreadyExistsException,
  WrongAuthenticationTokenException,
} from "_app/exceptions";
import axios from "axios";

export class NewsService {
  public user = userModel;

  static _sharedInstance: NewsService = null;

  static getInstance() {
    if (!NewsService._sharedInstance) {
      NewsService._sharedInstance = new NewsService();
    }
    return NewsService._sharedInstance;
  }



  public async getIpos(myId: string) {
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

      const { data }: any = await axios.get(
        `${FMP_CONFIG.API_BASE_URL}/api/v3/ipo_calendar?from=${startDate}&to=${endDate}&apikey=${Env.FMP_API_KEY}`
      );

      return data;
    } catch (error) {
      throw new HttpException(400, error);
    }

  }

  public async getMarketNews(limit: number, page: number, skip: number) {
    try {
      // const { data }: any = await axios.get(
      //   `https://stocknewsapi.com/api/v1/category?section=general&items=${limit}&page=${page}&token=${Env.STOCK_NEWS_API_KEY}`
      // );
      const stockNews = await this.getStockNews();
      const generalNews = await this.getGeneralNews();
      const data = await stockNews.concat(generalNews);
      data.sort((a: { publishedDate: string; }, b: { publishedDate: string; }) => {
        if (a.publishedDate < b.publishedDate) {
          return 1;
        }
        if (a.publishedDate > b.publishedDate) {
          return -1;
        }
        return 0;
      });
      return data;
    } catch (error) {
      throw new HttpException(400, error);
    }

  }

  private async getStockNews() {
    const { data }: { data: any } = await axios.get(
      `${FMP_CONFIG.API_BASE_URL}/api/v3/stock_news?limit=100&apikey=${Env.FMP_API_KEY}`
    );
    return data
  }
  private async getGeneralNews() {
    const { data } = await axios.get(
      `${FMP_CONFIG.API_BASE_URL}/api/v4/general_news?page=0&apikey=${Env.FMP_API_KEY}`
    );
    return data
  }

}
