"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const badgeSchema = new mongoose.Schema({
    title: { type: String },
    content: { type: String },
    number: { type: Number },
    type: { type: Number },
    activeUrl: String,
    inactiveUrl: String,
    isReceived: Boolean,
    receivedAt: Date,
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
badgeSchema.set("timestamps", true);
const badgeModel = mongoose.model("badge", badgeSchema);
exports.default = badgeModel;
//# sourceMappingURL=badge.model.js.map