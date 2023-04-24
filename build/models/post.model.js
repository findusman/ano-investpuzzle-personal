"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    content: String,
    photourl: String,
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
postSchema.virtual("comments", {
    ref: "post_comment",
    localField: "_id",
    foreignField: "post",
    count: true,
});
postSchema.virtual("likes", {
    ref: "post_like",
    localField: "_id",
    foreignField: "post",
    count: true,
    match: () => ({ isLike: true }),
});
postSchema.virtual("dislikes", {
    ref: "post_like",
    localField: "_id",
    foreignField: "post",
    count: true,
    match: () => ({ isLike: false }),
});
postSchema
    .virtual("isLiked", {
    ref: "post_like",
    localField: "_id",
    foreignField: "post",
})
    .get((obj) => obj && obj.length > 0);
postSchema
    .virtual("isDisliked", {
    ref: "post_like",
    localField: "_id",
    foreignField: "post",
})
    .get((obj) => obj && obj.length > 0);
postSchema.set("timestamps", true);
postSchema.index({ name: 1, ceo: 1, ipoyear: 1, sector: 1, industry: 1, description: 1 });
const postModel = mongoose.model("post", postSchema);
exports.default = postModel;
//# sourceMappingURL=post.model.js.map