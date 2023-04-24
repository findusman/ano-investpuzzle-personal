"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const sellSchema = new mongoose.Schema({
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
sellSchema
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
sellSchema.set("timestamps", true);
const sellModel = mongoose.model("sell", sellSchema);
exports.default = sellModel;
//# sourceMappingURL=sell.model.js.map