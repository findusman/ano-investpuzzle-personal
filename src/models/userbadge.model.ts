import * as mongoose from "mongoose";
import { UserBadge } from "../interfaces";

const userBadgeSchema = new mongoose.Schema(
  {
    badge: { type: mongoose.Schema.Types.ObjectId, ref: "badge"  },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user"  },
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



userBadgeSchema.set("timestamps", true);

const userBadgeModel = mongoose.model<UserBadge & mongoose.Document>("user_badge", userBadgeSchema);

export default userBadgeModel;
