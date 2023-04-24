"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
    type: { type: Number },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    linkedId: { type: String },
    content: { type: String },
    isRead: { type: Number },
    isAccept: { type: Number },
    groupData: { type: Object },
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
// 0: follow request, 
// 1: follow accepted, 
// 2: group invite,
// 3: group invite accepted, 
// 4: porume posted , 
// 5: commented on forume,, 
// 6: liked on forume, 
// 9: replied on comment, 
// 8: liked on comment, 
// 7: bage earned
//10 : group join request for private groups
//11 : group join request accepted
//12 : new user added in group
notificationSchema.set("timestamps", true);
const notificationModel = mongoose.model("notification", notificationSchema);
exports.default = notificationModel;
//# sourceMappingURL=notification.model.js.map