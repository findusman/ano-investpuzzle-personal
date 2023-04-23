import * as mongoose from "mongoose";
import { StockComment, StockCommentLike } from "../interfaces";

const stockCommentSchema = new mongoose.Schema(
  {
    stock: { type: mongoose.Schema.Types.ObjectId, ref: "stock" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    content: String,
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


stockCommentSchema.virtual("likes", {
  ref: "stock_comment_like",
  localField: "_id",
  foreignField: "stockcomment",
  count: true,
  match: () => ({ isLike: true }),
});

stockCommentSchema.virtual("dislikes", {
  ref: "stock_comment_like",
  localField: "_id",
  foreignField: "stockcomment",
  count: true,
  match: () => ({ isLike: false }),
});

stockCommentSchema
  .virtual("isLiked", {
    ref: "stock_comment_like",
    localField: "_id",
    foreignField: "stockcomment",
  })
  .get((obj: StockCommentLike[]) => obj && obj.length > 0);

  stockCommentSchema
  .virtual("isDisliked", {
    ref: "stock_comment_like",
    localField: "_id",
    foreignField: "stockcomment",
  })
  .get((obj: StockCommentLike[]) => obj && obj.length > 0);

  stockCommentSchema.set("timestamps", true);

  stockCommentSchema.index({ name: 1, ceo: 1, ipoyear: 1, sector: 1, industry: 1, description: 1 });

const stockCommentModel = mongoose.model<StockComment & mongoose.Document>("stock_comment", stockCommentSchema);

export default stockCommentModel;
