"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomInt = void 0;
const generateRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
};
exports.generateRandomInt = generateRandomInt;
//# sourceMappingURL=generateRandomInt.js.map