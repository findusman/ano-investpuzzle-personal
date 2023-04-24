"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const CustomScenarioValuesSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId },
    scenarioID: { type: mongoose.Types.ObjectId },
    value: Number,
    category: String,
    createdAt: Date,
    updatedAt: Date
});
CustomScenarioValuesSchema.set("timestamps", true);
const CustomScenarioValuesModel = mongoose.model("Custom_Scenario_Value", CustomScenarioValuesSchema);
exports.default = CustomScenarioValuesModel;
//# sourceMappingURL=customScenarioValue.model.js.map