"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const pronounsSchema = new mongoose.Schema({
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
pronounsSchema.set("timestamps", true);
pronounsSchema.index({ title: 1 });
const pronounsModel = mongoose.model("pronoun", pronounsSchema);
exports.default = pronounsModel;
//# sourceMappingURL=pronouns.model.js.map