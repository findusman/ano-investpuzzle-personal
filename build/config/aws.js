"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUCKETS = void 0;
const _1 = require(".");
exports.BUCKETS = {
    FILE: {
        dev: "investpuzzle",
        testing: "investpuzzle",
        staging: "investpuzzle",
        prod: "investpuzzle",
    }[_1.Env.APP_ENV],
};
//# sourceMappingURL=aws.js.map