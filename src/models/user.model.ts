import * as mongoose from "mongoose";

import { User, UserFollow } from "../interfaces";

export const userSchema = new mongoose.Schema(
  {
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
    loginType: String, // email, appple, google
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
    userType: Number, // 0: professor, 1: student
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
      get: (): undefined => undefined,
    },
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

userSchema.set("timestamps", true);

userSchema.virtual("followers", {
  ref: "user_follow",
  localField: "_id",
  foreignField: "leader",
  count: true,
});

userSchema.virtual("following", {
  ref: "user_follow",
  localField: "_id",
  foreignField: "user",
  count: true,
});

userSchema.virtual("following_stock", {
  ref: "stock_follow",
  localField: "_id",
  foreignField: "user",
  count: true,
});

userSchema
  .virtual("followed", {
    ref: "user_follow",
    localField: "_id",
    foreignField: "leader",
  })
  .get((obj: UserFollow[]) => obj && obj.length > 0);

userSchema.virtual("totalholdings", {
  ref: "buys",
  localField: "_id",
  foreignField: "user",
  //count: true,
});

userSchema
  .virtual("newPosts", {
    ref: "post",
    localField: "_id",
    foreignField: "owner",
    count: true,
    match: () => ({ createdAt: { $gte: new Date(new Date().getTime() - (24 * 60 * 60 * 1000)) } }),
  });

var autoPopulateProfile = function (next: any) {
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

userSchema.pre("findOne", autoPopulateProfile).pre("find", { document: true, query: true }, autoPopulateProfile);

userSchema.index({ email: 1, username: 1, userFullName: 1, bio: 1 });

const userModel = mongoose.model<User & mongoose.Document>("user", userSchema);

export default userModel;
