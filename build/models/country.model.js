"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const countrySchema = new mongoose.Schema({
    name: { type: String, unique: true },
    code: String,
    capital: String,
    region: String,
    currency: Object,
    flag: String,
}, {
    toJSON: {
        virtuals: true,
        getters: true,
        versionKey: false,
        transform: function (doc, ret) {
            delete ret._id;
        },
    },
});
countrySchema.set("timestamps", true);
countrySchema.index({ name: 1, capital: 1, region: 1, currency: 1 });
const countryModel = mongoose.model("country", countrySchema);
exports.default = countryModel;
//# sourceMappingURL=country.model.js.map