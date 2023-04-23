import * as mongoose from "mongoose";
import { Education } from "../interfaces";

const educationSchema = new mongoose.Schema(
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

educationSchema.set("timestamps", true);

educationSchema.index({ title: 1 });

const educationModel = mongoose.model<Education & mongoose.Document>("education", educationSchema);

export default educationModel;
