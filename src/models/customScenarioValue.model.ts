import * as mongoose from "mongoose";
import { customScenarioValue } from "../interfaces";


const CustomScenarioValuesSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId },
    scenarioID: { type: mongoose.Types.ObjectId },
    value: Number,
    category: String,
    createdAt: Date,
    updatedAt: Date

  });


CustomScenarioValuesSchema.set("timestamps", true);

const CustomScenarioValuesModel = mongoose.model<customScenarioValue & mongoose.Document>("Custom_Scenario_Value", CustomScenarioValuesSchema);

export default CustomScenarioValuesModel;
