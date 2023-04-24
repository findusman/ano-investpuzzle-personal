"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const authentication_controller_1 = require("./authentication.controller");
const user_controller_1 = require("./user.controller");
const upload_controller_1 = require("./upload.controller");
const common_controller_1 = require("./common.controller");
const stock_controller_1 = require("./stock.controller");
const trade_controller_1 = require("./trade.controller");
const group_controller_1 = require("./group.controller");
const notification_controller_1 = require("./notification.controller");
const post_controller_1 = require("./post.controller");
const chat_controller_1 = require("./chat.controller");
const news_controller_1 = require("./news.controller");
const customScenario_controller_1 = require("./customScenario.controller");
const controllers = (logger) => {
    return [
        new user_controller_1.default(logger),
        new authentication_controller_1.default(logger),
        new upload_controller_1.default(logger),
        new common_controller_1.default(logger),
        new stock_controller_1.default(logger),
        new trade_controller_1.default(logger),
        new group_controller_1.default(logger),
        new notification_controller_1.default(logger),
        new post_controller_1.default(logger),
        new chat_controller_1.default(logger),
        new news_controller_1.default(logger),
        new customScenario_controller_1.default(logger),
    ];
};
exports.controllers = controllers;
//# sourceMappingURL=index.js.map