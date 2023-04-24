"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = require("./HttpException");
class NotAuthorizedException extends HttpException_1.default {
    constructor() {
        super(403, "You're not authorized");
    }
}
exports.default = NotAuthorizedException;
//# sourceMappingURL=NotAuthorizedException.js.map