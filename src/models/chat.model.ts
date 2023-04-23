import * as mongoose from "mongoose";
import { Chat } from "../interfaces";

const chathistorySchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "chatroom" },
    message : String,
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


chathistorySchema.set("timestamps", true);

const chatModel = mongoose.model<Chat & mongoose.Document>("chat", chathistorySchema);

export default chatModel;
