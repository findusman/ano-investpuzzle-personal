"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const chathistorySchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "chatroom" },
    message: String,
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
chathistorySchema.set("timestamps", true);
const chatModel = mongoose.model("chat", chathistorySchema);
exports.default = chatModel;
//# sourceMappingURL=chat.model.js.map