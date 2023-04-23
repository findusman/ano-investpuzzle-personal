import * as mongoose from "mongoose";
import { Trade, Stock } from "../interfaces";

const sellSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    stock: { type: mongoose.Schema.Types.ObjectId, ref: "stock" },
    amount: { type: Number },
    quantity: { type: Number },
    currency : {type : String},
    currencyRate : {type : Number},
    usdAmount : {type : Number},
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

sellSchema
  .virtual("stockdetail", {
    ref: "stock",
    localField: "_id",
    foreignField: "stock",
  })
  .get((obj: Stock[]) => obj && obj.length > 0);

// var autoPopulateProfile = function (next: any) {
//   this.populate("followed");
//   next();
// };

// stocklistSchema.pre("findOne", autoPopulateProfile).pre("find", { document: true, query: true }, autoPopulateProfile);

sellSchema.set("timestamps", true);

const sellModel = mongoose.model<Trade & mongoose.Document>("sell", sellSchema);

export default sellModel;
