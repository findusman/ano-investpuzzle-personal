"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const returnDaySchema = new mongoose.Schema({
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
returnDaySchema.set("timestamps", true);
returnDaySchema.index({ returns: 1, percents: 1 });
const returnDayModel = mongoose.model("return_day", returnDaySchema);
exports.default = returnDayModel;
//# sourceMappingURL=returnDay.model.js.map