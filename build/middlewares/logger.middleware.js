"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function loggerMiddleware(logger) {
    return (request, response, next) => {
        response.on("finish", () => {
            if (response.statusCode === 200) {
                logger.debug({
                    url: request.url,
                    method: request.method,
                    request: request.body,
                    header: request.headers,
                    status: response.statusCode,
                });
            }
        });
        next();
    };
}
exports.default = loggerMiddleware;
//# sourceMappingURL=logger.middleware.js.map