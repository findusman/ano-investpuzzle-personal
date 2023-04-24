"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const groupSchema = new mongoose.Schema({
    groupName: { type: String, unique: true },
    groupPhoto: { type: String },
    isPublic: { type: Number },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    groupDescription: { type: String },
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
groupSchema.virtual("participants", {
    ref: "groupuser",
    localField: "_id",
    foreignField: "group",
    count: true,
    match: () => ({ isInviteAccepted: true }),
});
groupSchema
    .virtual("meincluded", {
    ref: "groupuser",
    localField: "_id",
    foreignField: "group",
})
    .get((obj) => obj && obj.length > 0);
groupSchema.set("timestamps", true);
const groupModel = mongoose.model("group", groupSchema);
exports.default = groupModel;
//# sourceMappingURL=group.model.js.map