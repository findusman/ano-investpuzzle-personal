"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const mongoose = require("mongoose");
exports.userSchema = new mongoose.Schema({
    localId: String,
    username: { type: String, index: { unique: true }, es_indexed: true },
    email: { type: String, index: { unique: true }, es_indexed: true },
    photoUrl: { type: String, es_indexed: true },
    pronoun: { type: mongoose.Schema.Types.ObjectId, ref: "pronoun" },
    yearOfBirth: { type: String, es_indexed: true },
    userFullName: String,
    education: { type: mongoose.Schema.Types.ObjectId, ref: "education" },
    otherEducation: String,
    otherPronouns: String,
    country: { type: mongoose.Schema.Types.ObjectId, ref: "country" },
    socialId: String,
    loginType: String,
    emailVerified: Boolean,
    coverImage: String,
    lastSignedInAt: String,
    bio: String,
    createdAt: Date,
    updatedAt: Date,
    availableFunds: Number,
    initFunds: Number,
    jwt: String,
    token: String,
    isApprovedByProfessor: Boolean,
    userType: Number,
    professor: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    //====== For professors only===========
    userPhone: String,
    universityName: String,
    title: String,
    fundName: String,
    fundsAum: String,
    endOfSubscriptionDate: Date,
    totalSubscribedNumberOfStudents: Number,
    inviteCode: String,
    passwordHash: {
        type: String,
        get: () => undefined,
    },
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
exports.userSchema.set("timestamps", true);
exports.userSchema.virtual("followers", {
    ref: "user_follow",
    localField: "_id",
    foreignField: "leader",
    count: true,
});
exports.userSchema.virtual("following", {
    ref: "user_follow",
    localField: "_id",
    foreignField: "user",
    count: true,
});
exports.userSchema.virtual("following_stock", {
    ref: "stock_follow",
    localField: "_id",
    foreignField: "user",
    count: true,
});
exports.userSchema
    .virtual("followed", {
    ref: "user_follow",
    localField: "_id",
    foreignField: "leader",
})
    .get((obj) => obj && obj.length > 0);
exports.userSchema.virtual("totalholdings", {
    ref: "buys",
    localField: "_id",
    foreignField: "user",
    //count: true,
});
exports.userSchema
    .virtual("newPosts", {
    ref: "post",
    localField: "_id",
    foreignField: "owner",
    count: true,
    match: () => ({ createdAt: { $gte: new Date(new Date().getTime() - (24 * 60 * 60 * 1000)) } }),
});
var autoPopulateProfile = function (next) {
    //this.populate({ path: "profile", select: { username: 1, email: 1, photoUrl: 1, pronouns: 1 } });
    this.populate("followers");
    this.populate("following");
    this.populate("following_stock");
    this.populate("pronoun");
    this.populate("country");
    this.populate("education");
    this.populate("professor");
    // this.populate("totalholdings");
    next();
};
exports.userSchema.pre("findOne", autoPopulateProfile).pre("find", { document: true, query: true }, autoPopulateProfile);
exports.userSchema.index({ email: 1, username: 1, userFullName: 1, bio: 1 });
const userModel = mongoose.model("user", exports.userSchema);
exports.default = userModel;
//# sourceMappingURL=user.model.js.map