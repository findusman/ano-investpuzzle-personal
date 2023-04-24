"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const groupuserSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "group" },
    isRemoved: { type: Number },
    isInviteAccepted: { type: Number },
    isOwner: { type: Number },
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
groupuserSchema.set("timestamps", true);
const groupuserModel = mongoose.model("groupuser", groupuserSchema);
exports.default = groupuserModel;
//# sourceMappingURL=groupuser.model.js.map