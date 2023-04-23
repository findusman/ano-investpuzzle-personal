import * as mongoose from "mongoose";
import { StockCommentLike } from "../interfaces";

const stockCommentLikeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    stockcomment: { type: mongoose.Schema.Types.ObjectId, ref: "stock_comment" },
    isLike: Boolean,
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

stockCommentLikeSchema.set("timestamps", true);

stockCommentLikeSchema.index({ name: 1, ceo: 1, ipoyear: 1, sector: 1, industry: 1, description: 1 });

const stockCommentLikeModel = mongoose.model<StockCommentLike & mongoose.Document>(
  "stock_comment_like",
  stockCommentLikeSchema
);

export default stockCommentLikeModel;
