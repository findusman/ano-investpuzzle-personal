"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const stockCommentLikeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    stockcomment: { type: mongoose.Schema.Types.ObjectId, ref: "stock_comment" },
    isLike: Boolean,
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
stockCommentLikeSchema.set("timestamps", true);
stockCommentLikeSchema.index({ name: 1, ceo: 1, ipoyear: 1, sector: 1, industry: 1, description: 1 });
const stockCommentLikeModel = mongoose.model("stock_comment_like", stockCommentLikeSchema);
exports.default = stockCommentLikeModel;
//# sourceMappingURL=stockcommentlike.model.js.map