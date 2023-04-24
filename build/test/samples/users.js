"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultUser = exports.testUsers = void 0;
const enums_1 = require("_app/enums");
exports.testUsers = [
    {
        firstName: "Bolt",
        lastName: "Tester",
        email: "tester@bolt.test",
        password: "123123123",
        username: "tester",
        product: enums_1.PRODUCTS.BOLT_PLUS,
    },
    {
        firstName: "Jone",
        lastName: "Doe",
        email: "tester1@bolt.test",
        password: "123123123",
        username: "tester1",
        product: enums_1.PRODUCTS.BOLT_PLUS,
    },
];
exports.defaultUser = exports.testUsers[0];
//# sourceMappingURL=users.js.map