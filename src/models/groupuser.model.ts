import * as mongoose from "mongoose";
import { GroupUser } from "../interfaces";

const groupuserSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "group" },
    isRemoved: { type: Number },
    isInviteAccepted: { type: Number },
    isOwner: { type: Number },
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

groupuserSchema.set("timestamps", true);

const groupuserModel = mongoose.model<GroupUser & mongoose.Document>("groupuser", groupuserSchema);

export default groupuserModel;
