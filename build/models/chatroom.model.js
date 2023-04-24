"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const chatroomSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    lastMessageSender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    room: String,
    lastMessage: String,
    messageType: String,
    createdAt: Date,
    updatedAt: Date,
}, {
    toJSON: {
        virtuals: true,
        getters: true,
        versionKey: false,
        transform: function (doc, ret) {
            delete ret._id;
        },
    },
});
chatroomSchema.set("timestamps", true);
const chatroomModel = mongoose.model("chatroom", chatroomSchema);
exports.default = chatroomModel;
//# sourceMappingURL=chatroom.model.js.map