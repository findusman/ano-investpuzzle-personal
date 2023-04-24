"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const buySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    stock: { type: mongoose.Schema.Types.ObjectId, ref: "stock" },
    amount: { type: Number },
    quantity: { type: Number },
    currency: { type: String },
    currencyRate: { type: Number },
    usdAmount: { type: Number },
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
buySchema
    .virtual("stockdetail", {
    ref: "stock",
    localField: "_id",
    foreignField: "stock",
})
    .get((obj) => obj && obj.length > 0);
// var autoPopulateProfile = function (next: any) {
//   this.populate("followed");
//   next();
// };
// stocklistSchema.pre("findOne", autoPopulateProfile).pre("find", { document: true, query: true }, autoPopulateProfile);
buySchema.set("timestamps", true);
const buyModel = mongoose.model("buy", buySchema);
exports.default = buyModel;
//# sourceMappingURL=buy.model.js.map