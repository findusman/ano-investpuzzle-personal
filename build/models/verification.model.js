"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const verificationSchema = new mongoose.Schema({
    email: String,
    type: String,
    token: String,
    code: String,
    expiresAt: Date,
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
verificationSchema.set("timestamps", true);
const verificationModel = mongoose.model("verification", verificationSchema);
exports.default = verificationModel;
//# sourceMappingURL=verification.model.js.map