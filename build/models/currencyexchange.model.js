"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const currencyexchangeSchema = new mongoose.Schema({
    currency: { type: String },
    bid: { type: Number },
    ask: { type: Number },
    open: { type: Number },
    low: { type: Number },
    high: { type: Number },
    changes: { type: Number },
    createdAt: Date,
    updatedAt: Date,
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
currencyexchangeSchema.set("timestamps", true);
const currencyexchangeModel = mongoose.model("currencyexchange", currencyexchangeSchema);
exports.default = currencyexchangeModel;
//# sourceMappingURL=currencyexchange.model.js.map