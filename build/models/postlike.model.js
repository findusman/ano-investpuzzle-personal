"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const postLikeSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: "post" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
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
postLikeSchema.set("timestamps", true);
postLikeSchema.index({ name: 1, ceo: 1, ipoyear: 1, sector: 1, industry: 1, description: 1 });
const postLikeModel = mongoose.model("post_like", postLikeSchema);
exports.default = postLikeModel;
//# sourceMappingURL=postlike.model.js.map