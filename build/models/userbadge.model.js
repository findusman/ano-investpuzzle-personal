"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const userBadgeSchema = new mongoose.Schema({
    badge: { type: mongoose.Schema.Types.ObjectId, ref: "badge" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
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
userBadgeSchema.set("timestamps", true);
const userBadgeModel = mongoose.model("user_badge", userBadgeSchema);
exports.default = userBadgeModel;
//# sourceMappingURL=userbadge.model.js.map