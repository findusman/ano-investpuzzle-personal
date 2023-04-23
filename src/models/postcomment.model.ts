import * as mongoose from "mongoose";
import { CommentLike, PostComment } from "../interfaces";

const postcommentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "post" },
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

postcommentSchema.virtual("replies", {
  ref: "post_owner_reply",
  localField: "_id",
  foreignField: "comment",
});

postcommentSchema.virtual("likes", {
  ref: "post_comment_like",
  localField: "_id",
  foreignField: "comment",
  count: true,
  match: () => ({ isLike: true }),
});

postcommentSchema.virtual("dislikes", {
  ref: "post_comment_like",
  localField: "_id",
  foreignField: "comment",
  count: true,
  match: () => ({ isLike: false }),
});

postcommentSchema
  .virtual("isLiked", {
    ref: "post_comment_like",
    localField: "_id",
    foreignField: "comment",
  })
  .get((obj: CommentLike[]) => obj && obj.length > 0);

postcommentSchema
  .virtual("isDisliked", {
    ref: "post_comment_like",
    localField: "_id",
    foreignField: "comment",
  })
  .get((obj: CommentLike[]) => obj && obj.length > 0);

postcommentSchema.set("timestamps", true);

postcommentSchema.index({ name: 1, ceo: 1, ipoyear: 1, sector: 1, industry: 1, description: 1 });

const postCommentModel = mongoose.model<PostComment & mongoose.Document>("post_comment", postcommentSchema);

export default postCommentModel;
