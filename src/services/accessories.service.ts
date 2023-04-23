import * as Papa from "papaparse";
import moment = require("moment");
import { userModel, pronounsModel, educationModel, countryModel, stockModel } from "_app/models";
import {} from "_app/dtos";

export class AccessoriesService {
  public user = userModel;
  public pronouns = pronounsModel;
  public education = educationModel;
  public country = countryModel;
  public stock = stockModel;
  static _sharedInstance: AccessoriesService = null;

  static getInstance() {
    if (!AccessoriesService._sharedInstance) {
      AccessoriesService._sharedInstance = new AccessoriesService();
    }
    return AccessoriesService._sharedInstance;
  }

  public async getPronounsByTitle(title: string) {
    return await this.pronouns.findOne({ title });
  }

  public async getPronounsById(id: string) {
    return await this.pronouns.findById(id);
  }

  public async getEducationByTitle(title: string) {
    return await this.education.findOne({ title });
  }

  public async getEducationById(id: string) {
    return await this.education.findById(id);
  }

  public async getCountryByName(name: string) {
    return await this.country.findOne({ name });
  }

  public async getCountryById(id: string) {
    return await this.country.findById(id);
  }

  public async getProunsEducationCountries() {
    const educations = await this.education.find();
    const pronounses = await this.pronouns.find();
    const countries = await this.country.find().sort({ name: 1 });
    return { pronounses, educations, countries };
  }

  public async getStocklistByTicker(symbol: string) {
    return await this.stock.findOne({ symbol });
  }
  public async getStocklistByTitle(title: string) {
    return await this.stock.findOne({ title });
  }
}
