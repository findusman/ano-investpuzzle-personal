"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBinancePaySignature = void 0;
const crypto = require("crypto");
const generateBinancePaySignature = (payload, key) => {
    var hmac = crypto.createHmac("sha512", key);
    var data = hmac.update(payload);
    return data.digest("hex").toUpperCase();
};
exports.generateBinancePaySignature = generateBinancePaySignature;
//# sourceMappingURL=generateBinancePaySignature.js.map