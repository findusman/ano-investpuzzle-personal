import * as mongoose from "mongoose";
import { Return } from "../interfaces";

const returnHourSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    returns: Number,
    percents: Number,
    investing: Number,
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

returnHourSchema.set("timestamps", true);

returnHourSchema.index({ returns: 1, percents: 1 });

const returnHourModel = mongoose.model<Return & mongoose.Document>("return_hour", returnHourSchema);

export default returnHourModel;
