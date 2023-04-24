"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const userFollowSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    isAccepted: { type: Number },
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
userFollowSchema.set("timestamps", true);
const userFollowModel = mongoose.model("user_follow", userFollowSchema);
exports.default = userFollowModel;
//# sourceMappingURL=userFollow.model.js.map