"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = require("./HttpException");
class AlreadyExistsException extends HttpException_1.default {
    constructor(message) {
        super(409, message || "Already exists");
    }
}
exports.default = AlreadyExistsException;
//# sourceMappingURL=AlreadyExistsException.js.map