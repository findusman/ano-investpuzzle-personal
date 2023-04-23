import * as mongoose from "mongoose";
import { Rank } from "../interfaces";

const rankSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
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

rankSchema.set("timestamps", true);

const rankModel = mongoose.model<Rank & mongoose.Document>("rank", rankSchema);

export default rankModel;
