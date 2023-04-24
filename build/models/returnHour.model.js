"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const returnHourSchema = new mongoose.Schema({
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
returnHourSchema.set("timestamps", true);
returnHourSchema.index({ returns: 1, percents: 1 });
const returnHourModel = mongoose.model("return_hour", returnHourSchema);
exports.default = returnHourModel;
//# sourceMappingURL=returnHour.model.js.map