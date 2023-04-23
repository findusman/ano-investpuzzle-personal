import * as mongoose from "mongoose";
import { CurrencyExchange } from "../interfaces";

const currencyexchangeSchema = new mongoose.Schema(
  {
    currency: { type: String},
    bid: { type: Number },
    ask: { type: Number },
    open: { type: Number },
    low: { type: Number },
    high: { type: Number },
    changes: { type: Number },
    createdAt: Date,
    updatedAt: Date,
  },
  {
    toJSON: {
      virtuals: true,
      getters: true,
      versionKey: false,
      transform: function (doc: any, ret: any) {
        delete ret._id;
      },
    },
  }
);



currencyexchangeSchema.set("timestamps", true);

const currencyexchangeModel = mongoose.model<CurrencyExchange & mongoose.Document>("currencyexchange", currencyexchangeSchema);

export default currencyexchangeModel;