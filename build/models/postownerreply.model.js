"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const postOwnerReplySchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: "post" },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "post_comment" },
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
postOwnerReplySchema.set("timestamps", true);
postOwnerReplySchema.index({ name: 1, ceo: 1, ipoyear: 1, sector: 1, industry: 1, description: 1 });
const postOwnerReplyModel = mongoose.model("post_owner_reply", postOwnerReplySchema);
exports.default = postOwnerReplyModel;
//# sourceMappingURL=postownerreply.model.js.map