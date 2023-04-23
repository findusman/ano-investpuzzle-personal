import * as mongoose from "mongoose";
import { Pronouns } from "../interfaces";

const pronounsSchema = new mongoose.Schema(
  {
    title: { type: String, unique: true },
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

pronounsSchema.set("timestamps", true);

pronounsSchema.index({ title: 1 });

const pronounsModel = mongoose.model<Pronouns & mongoose.Document>("pronoun", pronounsSchema);

export default pronounsModel;
