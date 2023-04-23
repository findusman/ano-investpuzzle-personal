import * as mongoose from "mongoose";
import { Badge } from "../interfaces";

const badgeSchema = new mongoose.Schema(
  {
    title: { type: String },
    content: { type: String },
    number : {type : Number},
    type : {type : Number}, //0: followers, 1: ranking
    activeUrl : String,
    inactiveUrl : String,
    isReceived : Boolean,
    receivedAt : Date,
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



badgeSchema.set("timestamps", true);

const badgeModel = mongoose.model<Badge & mongoose.Document>("badge", badgeSchema);

export default badgeModel;
