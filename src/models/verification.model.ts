import * as mongoose from "mongoose";
import { Verification } from "../interfaces";

const verificationSchema = new mongoose.Schema(
  {
    email: String,
    type: String,
    token: String,
    code: String,
    expiresAt: Date,
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

verificationSchema.set("timestamps", true);

const verificationModel = mongoose.model<Verification & mongoose.Document>("verification", verificationSchema);

export default verificationModel;
