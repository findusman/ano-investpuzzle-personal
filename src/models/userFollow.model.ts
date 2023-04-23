import * as mongoose from "mongoose";
import { UserFollow } from "../interfaces";

const userFollowSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    isAccepted: { type: Number },
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

userFollowSchema.set("timestamps", true);

const userFollowModel = mongoose.model<UserFollow & mongoose.Document>("user_follow", userFollowSchema);

export default userFollowModel;
