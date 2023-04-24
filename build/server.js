"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
require("dotenv").config("../.env");
const http = require("http");
const JSONBigInt = require("json-bigint");
const app_1 = require("./app");
const socket_1 = require("./socket");
const controllers_1 = require("_app/controllers");
const utils_1 = require("_app/utils");
const factories_1 = require("_app/factories");
console.log(`Environment = ${process.env.APP_ENV}`);
if (process.env.APP_ENV !== "testing") {
    // skip env vailidation on testing mode
    (0, utils_1.validateEnv)();
}
JSON.parse = JSONBigInt.parse; // Override prototype method
JSON.stringify = JSONBigInt.stringify; // Override prototype method
const PORT = process.env.PORT || 5000;
const logConfig = {
    service: "wafflestock-api",
    logglyToken: process.env.LOGGLY_TOKEN,
    logglySubdomain: process.env.LOGGLY_SUBDOMAIN,
    tag: process.env.APP_ENV,
};
const loggerFactory = new factories_1.LoggerFactory(logConfig);
const Controllers = (0, controllers_1.controllers)(loggerFactory);
const app = new app_1.default(loggerFactory, [...Controllers]);
exports.server = http.createServer(app.app);
exports.server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
(0, socket_1.initSocketConnect)(exports.server);
//# sourceMappingURL=server.js.map