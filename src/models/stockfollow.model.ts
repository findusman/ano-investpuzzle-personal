import * as mongoose from "mongoose";
import { StockFollow } from "../interfaces";

const stockFollowSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    stock: { type: mongoose.Schema.Types.ObjectId, ref: "stock" },
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

stockFollowSchema.set("timestamps", true);

const stockFollowModel = mongoose.model<StockFollow & mongoose.Document>("stock_follow", stockFollowSchema);

export default stockFollowModel;
