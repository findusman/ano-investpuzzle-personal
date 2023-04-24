"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const postCommentLikeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "post" },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "post_comment" },
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
postCommentLikeSchema.set("timestamps", true);
postCommentLikeSchema.index({ name: 1, ceo: 1, ipoyear: 1, sector: 1, industry: 1, description: 1 });
const postCommentLikeModel = mongoose.model("post_comment_like", postCommentLikeSchema);
exports.default = postCommentLikeModel;
//# sourceMappingURL=postcommentlike.model.js.map