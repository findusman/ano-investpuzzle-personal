import * as crypto from "crypto";

export const generateBinancePaySignature = (payload: string, key: string) => {
  var hmac = crypto.createHmac("sha512", key);
  var data = hmac.update(payload);
  return data.digest("hex").toUpperCase();
};
