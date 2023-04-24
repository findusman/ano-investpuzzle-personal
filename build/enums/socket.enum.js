"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTIFICATION_TYPE = exports.MESSAGE_TYPE = void 0;
var MESSAGE_TYPE;
(function (MESSAGE_TYPE) {
    MESSAGE_TYPE["TEXT"] = "text";
    MESSAGE_TYPE["IMAGE"] = "image";
    MESSAGE_TYPE["VIDEO"] = "video";
    MESSAGE_TYPE["AUDIO"] = "audio";
    MESSAGE_TYPE["GIFT"] = "gift";
    MESSAGE_TYPE["TIP"] = "tip";
    MESSAGE_TYPE["NOTICE"] = "notice";
})(MESSAGE_TYPE = exports.MESSAGE_TYPE || (exports.MESSAGE_TYPE = {}));
var NOTIFICATION_TYPE;
(function (NOTIFICATION_TYPE) {
    NOTIFICATION_TYPE["MESSAGE"] = "message";
    NOTIFICATION_TYPE["GIFT"] = "gift";
    NOTIFICATION_TYPE["TIP"] = "tip";
    NOTIFICATION_TYPE["NOTICE"] = "notice";
    NOTIFICATION_TYPE["VIEWER"] = "viewer";
    NOTIFICATION_TYPE["STREAM"] = "stream";
})(NOTIFICATION_TYPE = exports.NOTIFICATION_TYPE || (exports.NOTIFICATION_TYPE = {}));
//# sourceMappingURL=socket.enum.js.map