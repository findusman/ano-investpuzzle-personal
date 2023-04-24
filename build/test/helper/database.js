"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.cleanDatabase = exports.connectDatabase = void 0;
const mongoose = require("mongoose");
const connectDatabase = async () => {
    try {
        console.log("#Database: ", process.env.MONGO_PATH);
        await mongoose.connect(process.env.MONGO_PATH);
    }
    catch (error) {
        console.error("Database connection error: ", error);
    }
};
exports.connectDatabase = connectDatabase;
const cleanDatabase = async () => {
    await mongoose.connection.dropDatabase();
};
exports.cleanDatabase = cleanDatabase;
const disconnectDatabase = async () => {
    await mongoose.disconnect();
    console.log("Database disconnected");
};
exports.disconnectDatabase = disconnectDatabase;
//# sourceMappingURL=database.js.map