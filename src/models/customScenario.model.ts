import * as mongoose from "mongoose";
import { customScenario } from "../interfaces";


const customScenarioSchema = new mongoose.Schema(
  {

    category: { type: String },
    subCategory: { type: String, index: { unique: true } },
    alias: { type: String },
    createdAt: Date,
    updatedAt: Date,

  }
);



customScenarioSchema.set("timestamps", true);

const customScenarioModel = mongoose.model<customScenario & mongoose.Document>("Custom_Scenario", customScenarioSchema);

export default customScenarioModel;
