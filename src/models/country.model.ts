import * as mongoose from "mongoose";
import { Country } from "../interfaces";

const countrySchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    code: String,
    capital: String,
    region: String,
    currency: Object,
    flag: String,
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

countrySchema.set("timestamps", true);

countrySchema.index({ name: 1, capital: 1, region: 1, currency: 1 });

const countryModel = mongoose.model<Country & mongoose.Document>("country", countrySchema);

export default countryModel;
