"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const stockFollowSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    stock: { type: mongoose.Schema.Types.ObjectId, ref: "stock" },
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
stockFollowSchema.set("timestamps", true);
const stockFollowModel = mongoose.model("stock_follow", stockFollowSchema);
exports.default = stockFollowModel;
//# sourceMappingURL=stockfollow.model.js.map