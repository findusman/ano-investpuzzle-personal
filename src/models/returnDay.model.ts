import * as mongoose from "mongoose";
import { Return } from "../interfaces";

const returnDaySchema = new mongoose.Schema(
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

returnDaySchema.set("timestamps", true);

returnDaySchema.index({ returns: 1, percents: 1 });

const returnDayModel = mongoose.model<Return & mongoose.Document>("return_day", returnDaySchema);

export default returnDayModel;
