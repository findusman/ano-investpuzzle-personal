"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessoriesService = void 0;
const models_1 = require("_app/models");
class AccessoriesService {
    constructor() {
        this.user = models_1.userModel;
        this.pronouns = models_1.pronounsModel;
        this.education = models_1.educationModel;
        this.country = models_1.countryModel;
        this.stock = models_1.stockModel;
    }
    static getInstance() {
        if (!AccessoriesService._sharedInstance) {
            AccessoriesService._sharedInstance = new AccessoriesService();
        }
        return AccessoriesService._sharedInstance;
    }
    async getPronounsByTitle(title) {
        return await this.pronouns.findOne({ title });
    }
    async getPronounsById(id) {
        return await this.pronouns.findById(id);
    }
    async getEducationByTitle(title) {
        return await this.education.findOne({ title });
    }
    async getEducationById(id) {
        return await this.education.findById(id);
    }
    async getCountryByName(name) {
        return await this.country.findOne({ name });
    }
    async getCountryById(id) {
        return await this.country.findById(id);
    }
    async getProunsEducationCountries() {
        const educations = await this.education.find();
        const pronounses = await this.pronouns.find();
        const countries = await this.country.find().sort({ name: 1 });
        return { pronounses, educations, countries };
    }
    async getStocklistByTicker(symbol) {
        return await this.stock.findOne({ symbol });
    }
    async getStocklistByTitle(title) {
        return await this.stock.findOne({ title });
    }
}
exports.AccessoriesService = AccessoriesService;
AccessoriesService._sharedInstance = null;
//# sourceMappingURL=accessories.service.js.map