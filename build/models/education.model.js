"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const educationSchema = new mongoose.Schema({
    title: { type: String, unique: true },
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
educationSchema.set("timestamps", true);
educationSchema.index({ title: 1 });
const educationModel = mongoose.model("education", educationSchema);
exports.default = educationModel;
//# sourceMappingURL=education.model.js.map