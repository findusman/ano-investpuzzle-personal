import * as mongoose from "mongoose";
import { PostLike } from "../interfaces";

const postLikeSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "post" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
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

postLikeSchema.set("timestamps", true);

postLikeSchema.index({ name: 1, ceo: 1, ipoyear: 1, sector: 1, industry: 1, description: 1 });

const postLikeModel = mongoose.model<PostLike & mongoose.Document>("post_like", postLikeSchema);

export default postLikeModel;
