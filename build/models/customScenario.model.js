"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const customScenarioSchema = new mongoose.Schema({
    category: { type: String },
    subCategory: { type: String, index: { unique: true } },
    alias: { type: String },
    createdAt: Date,
    updatedAt: Date,
});
customScenarioSchema.set("timestamps", true);
const customScenarioModel = mongoose.model("Custom_Scenario", customScenarioSchema);
exports.default = customScenarioModel;
//# sourceMappingURL=customScenario.model.js.map