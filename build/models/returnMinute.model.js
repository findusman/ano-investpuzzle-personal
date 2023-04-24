"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const returnMinuteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    returns: Number,
    percents: Number,
    investing: Number,
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
returnMinuteSchema.set("timestamps", true);
returnMinuteSchema.index({ returns: 1, percents: 1 });
const returnMinuteModel = mongoose.model("return_minute", returnMinuteSchema);
exports.default = returnMinuteModel;
//# sourceMappingURL=returnMinute.model.js.map