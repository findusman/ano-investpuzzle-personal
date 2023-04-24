"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const stockCommentSchema = new mongoose.Schema({
    stock: { type: mongoose.Schema.Types.ObjectId, ref: "stock" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    content: String,
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
stockCommentSchema.virtual("likes", {
    ref: "stock_comment_like",
    localField: "_id",
    foreignField: "stockcomment",
    count: true,
    match: () => ({ isLike: true }),
});
stockCommentSchema.virtual("dislikes", {
    ref: "stock_comment_like",
    localField: "_id",
    foreignField: "stockcomment",
    count: true,
    match: () => ({ isLike: false }),
});
stockCommentSchema
    .virtual("isLiked", {
    ref: "stock_comment_like",
    localField: "_id",
    foreignField: "stockcomment",
})
    .get((obj) => obj && obj.length > 0);
stockCommentSchema
    .virtual("isDisliked", {
    ref: "stock_comment_like",
    localField: "_id",
    foreignField: "stockcomment",
})
    .get((obj) => obj && obj.length > 0);
stockCommentSchema.set("timestamps", true);
stockCommentSchema.index({ name: 1, ceo: 1, ipoyear: 1, sector: 1, industry: 1, description: 1 });
const stockCommentModel = mongoose.model("stock_comment", stockCommentSchema);
exports.default = stockCommentModel;
//# sourceMappingURL=stockcomment.model.js.map