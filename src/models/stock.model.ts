import * as mongoose from "mongoose";
import { Stock, StockFollow } from "../interfaces";

const stockSchema = new mongoose.Schema(
  {
    symbol: { type: String, unique: true },
    name: String,
    price: Number,
    beta : Number,
    changesPercentage: Number,
    change: Number,
    dayLow: Number,
    dayHigh: Number,
    yearHigh: Number,
    yearLow: Number,
    marketCap: Number,
    priceAvg50: Number,
    priceAvg200: Number,
    volume: Number,
    avgVolume: Number,
    currency : String,
    exchange: String,
    open: Number,
    previousClose: Number,
    eps: Number,
    pe: String,
    earningsAnnouncement: Date,
    sharesOutstanding: Number,
    timestamp: { type: Date, default: Date.now },
    country: String,
    ipoyear: String,
    sector: String,
    industry: String,
    mktCap: Number,
    website: String,
    description: String,
    ceo: String,
    image: String,
    ipoDate: String,
    currencyRate : Number,
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

stockSchema
  .virtual("followed", {
    ref: "stock_follow",
    localField: "_id",
    foreignField: "stock",
  })
  .get((obj: StockFollow[]) => obj && obj.length > 0);

stockSchema
  .virtual("holding", {
    ref: "holding",
    localField: "_id",
    foreignField: "stock",
    // match: () => ({ createdAt: { $gte: new Date(new Date().getTime() - (24 * 60 * 60 * 1000)) } }),
  });

// var autoPopulateProfile = function (next: any) {
//   this.populate("followed");
//   next();
// };

// stocklistSchema.pre("findOne", autoPopulateProfile).pre("find", { document: true, query: true }, autoPopulateProfile);

stockSchema.set("timestamps", true);

stockSchema.index({ name: 1, ceo: 1, ipoyear: 1, sector: 1, industry: 1, description: 1 });

const stockModel = mongoose.model<Stock & mongoose.Document>("stock", stockSchema);

export default stockModel;
