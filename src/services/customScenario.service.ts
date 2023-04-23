import * as Papa from "papaparse";
import moment = require("moment");

import { customScenarioValueModel, customScenarioModel, badgeModel, userBadgeModel, userModel, notificationModel, stockModel } from "_app/models";
import { NotificationService, StockService } from "_app/services";

import { } from "_app/dtos";
import { Env } from "_app/config";
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
import { Badge, UserBadge } from "_app/interfaces";

export class CustomScenarioService {
  public user = userModel;
  public badge = badgeModel;
  public receivedBadge = userBadgeModel;
  public notification = notificationModel;
  public customScenarioValue = customScenarioValueModel;
  public customScenario = customScenarioModel;
  public stock = stockModel;
  public stockService = StockService._sharedInstance





  public notificationService = new NotificationService();

  static _sharedInstance: CustomScenarioService = null;

  static getInstance() {
    if (!CustomScenarioService._sharedInstance) {
      CustomScenarioService._sharedInstance = new CustomScenarioService();
    }
    return CustomScenarioService._sharedInstance;
  }




  public async matchStock(stockId: String) {


    let regionBreakdownValue: number = 0;
    let sectorBreakdownValue: number = 0;
    let marketCapBreakdownValue: number = 0;
    let BetaBreakdownValue: number = 0;



    let stockWithRegion = await this.stockService.getStockByIdWithRegion(stockId)


    let stockSector = stockWithRegion[0].sector
    let stockmarketCap = stockWithRegion[0].marketCap
    let stockRegion = stockWithRegion[0].region[0].region
    let stockBeta = stockWithRegion[0].beta


    console.log([stockSector, stockmarketCap, stockRegion, stockBeta]);


    let scenarios = await this.getAllCustomScenarios()
    let scenariosJSON = JSON.parse(JSON.stringify(scenarios));

    for await (const scenario of scenariosJSON) {

      const scenarioCategory = scenario.category
      const scenariosubCategory = scenario.subCategory
      const scenariovalue: number = scenario.value

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

    let _totalBreakDownValue = regionBreakdownValue + sectorBreakdownValue + marketCapBreakdownValue + BetaBreakdownValue;
    // console.log(_totalBreakDownValue);
    // console.log({ 'region': regionBreakdownValue }, { 'sector': sectorBreakdownValue }, { 'market cap': marketCapBreakdownValue });

    return (1 + (_totalBreakDownValue / 100));
  }


  public async getAllCustomScenarios() {

    let scenarios = await this.customScenario.find().sort('category');
    let scenariosJSON = JSON.parse(JSON.stringify(scenarios));

    for await (const scenario of scenariosJSON) {

      const scenarioID = scenario._id
      scenario.id = scenario._id;
      let docValues = await this.customScenarioValue.findOne({ "scenarioID": new mongoose.Types.ObjectId(scenarioID) }).exec()

      if (docValues)
        scenario.value = docValues.value

      else
        scenario.value = 0
    }
    return scenariosJSON;
  }

  public async addValue(

    userId: string,
    scenarioBody: string

  ) {


    // console.log(scenarioBody);
    // console.log(JSON.stringify(scenarioBody));
    // console.log(JSON.parse(JSON.stringify(scenarioBody)));

    await this.customScenarioValue.deleteMany({})

    await Promise.all(
      JSON.parse(scenarioBody).map(async (singdoc: any) => {

        singdoc.user = new mongoose.Types.ObjectId(userId)
        const scenarioValue = await this.customScenarioValue.create({

          user: new mongoose.Types.ObjectId(userId),
          scenarioID: new mongoose.Types.ObjectId(singdoc.scenarioID),
          value: singdoc.value,
          category: singdoc.category,
          createdAt: moment().unix() * 1000,
        });

      })
    );




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





  public async getBadgeById(id: string) {
    const query = this.badge.findById(id);
    return await query;
  }

  public async getBadgeByTitle(title: string) {
    return await this.badge.findOne({ title });
  }

  public async getReceivedBadgeById(id: string) {
    const query = this.receivedBadge.findById(id);
    return await query;
  }

  public async registerReceivedBadge(
    badgeId: string,
    userId: string,
  ) {
    const badgeExistForThisUser = await this.receivedBadge.findOne({ badge: new mongoose.Types.ObjectId(badgeId), user: new mongoose.Types.ObjectId(userId) });
    if (badgeExistForThisUser) {
      throw new HttpException(400, "This user already received this badge");
    } else {
      const receivedBadgeItem = await this.receivedBadge.create({
        badge: new mongoose.Types.ObjectId(badgeId),
        user: new mongoose.Types.ObjectId(userId),
        createdAt: moment().unix() * 1000,
      });
      await this.notificationService.createNotification(
        userId.toString(),
        userId.toString(),
        7,
        "",
        "Congratulation! you earned a new badge",
        1
      );
      return receivedBadgeItem;
    }
  }



  public async getAllBadges() {
    return await this.badge.find();
  }

  public async getUserBadges(
    userId: string,
  ) {
    let availableBadges = await this.badge.find();
    const userBadges = await Promise.all(availableBadges.map(async (oneBadge: Badge, i) => {
      const userReceivedThisBadge = await this.receivedBadge.findOne({ user: new mongoose.Types.ObjectId(userId), badge: oneBadge._id });
      if (userReceivedThisBadge) {
        oneBadge.isReceived = true;
        oneBadge.receivedAt = userReceivedThisBadge.createdAt;
        return oneBadge;
      } else {
        return oneBadge;
      }
    }));
    return userBadges;
  }
}
