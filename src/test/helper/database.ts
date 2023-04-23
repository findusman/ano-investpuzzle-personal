import * as mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    console.log("#Database: ", process.env.MONGO_PATH);
    await mongoose.connect(process.env.MONGO_PATH);
  } catch (error) {
    console.error("Database connection error: ", error);
  }
};

export const cleanDatabase = async () => {
  await mongoose.connection.dropDatabase();
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
  console.log("Database disconnected");
};
