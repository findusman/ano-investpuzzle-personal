import * as mongoose from "mongoose";
import { ChatRoom } from "../interfaces";

const chatroomSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    lastMessageSender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    room : String,
    lastMessage : String,
    messageType : String,
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


chatroomSchema.set("timestamps", true);

const chatroomModel = mongoose.model<ChatRoom & mongoose.Document>("chatroom", chatroomSchema);

export default chatroomModel;
