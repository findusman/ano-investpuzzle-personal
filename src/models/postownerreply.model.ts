import * as mongoose from "mongoose";
import { PostOwnerReply} from "../interfaces";

const postOwnerReplySchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "post" },  
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "post_comment" },   
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


postOwnerReplySchema.set("timestamps", true);

postOwnerReplySchema.index({ name: 1, ceo: 1, ipoyear: 1, sector: 1, industry: 1, description: 1 });

const postOwnerReplyModel = mongoose.model<PostOwnerReply & mongoose.Document>("post_owner_reply", postOwnerReplySchema);

export default postOwnerReplyModel;
