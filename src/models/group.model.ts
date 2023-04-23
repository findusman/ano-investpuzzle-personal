import * as mongoose from "mongoose";
import { Group, GroupUser } from "../interfaces";

const groupSchema = new mongoose.Schema(
  {
    groupName: { type: String, unique: true },
    groupPhoto: { type: String },
    isPublic: { type: Number },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    groupDescription: { type: String },
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

groupSchema.virtual("participants", {
  ref: "groupuser",
  localField: "_id",
  foreignField: "group",
  count: true,
  match: () => ({ isInviteAccepted: true }),
});


groupSchema
  .virtual("meincluded", {
    ref: "groupuser",
    localField: "_id",
    foreignField: "group",
  })
  .get((obj: GroupUser[]) => obj && obj.length > 0);

groupSchema.set("timestamps", true);

const groupModel = mongoose.model<Group & mongoose.Document>("group", groupSchema);

export default groupModel;
