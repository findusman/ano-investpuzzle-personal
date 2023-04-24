"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const envalid_1 = require("envalid");
function validateEnv() {
    (0, envalid_1.cleanEnv)(process.env, {
        JWT_SECRET: (0, envalid_1.str)(),
        MONGO_PATH: (0, envalid_1.str)(),
        PORT: (0, envalid_1.port)(),
        ENABLE_FULL_LOG: (0, envalid_1.num)(),
        LOGGLY_TOKEN: (0, envalid_1.str)(),
        LOGGLY_SUBDOMAIN: (0, envalid_1.str)(),
        APP_ENV: (0, envalid_1.str)(),
        FIREBASE_API_KEY: (0, envalid_1.str)(),
        FIREBASE_AUTH_SIGNER_KEY: (0, envalid_1.str)(),
        FIREBASE_AUTH_SALT_SEPARTOR: (0, envalid_1.str)(),
        AWS_ACCESS_KEY: (0, envalid_1.str)(),
        AWS_SECRET_KEY: (0, envalid_1.str)(),
        AWS_REGION: (0, envalid_1.str)(),
    });
}
exports.default = validateEnv;
//# sourceMappingURL=validateEnv.js.map