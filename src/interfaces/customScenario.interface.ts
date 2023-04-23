import { bool } from "aws-sdk/clients/signer";
import { Request } from "express";

export interface customScenario {
  _id: string;
  category: String,
  subCategory: String,
  alias: String,
  createdAt: Date,
  updatedAt: Date,

}

export interface customScenarioValue {
  _id: string;
  scenarioID: string,
  value: Number,
  category: String,
  createdAt: Date,
  updatedAt: Date

}