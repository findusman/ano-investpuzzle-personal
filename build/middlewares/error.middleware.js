"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function errorMiddleware(logger) {
    return (error, request, response, next) => {
        if (logger) {
            logger.error({
                url: request.url,
                method: request.method,
                request: request.body,
                header: request.headers,
                status: error.status,
                error: {
                    stack: error.stack,
                    message: error.message,
                    status: error.status,
                    name: error.name,
                },
            });
        }
        const status = error.status || 500;
        const message = error.message || "Something went wrong";
        response.status(status).send({
            message,
            status,
        });
    };
}
exports.default = errorMiddleware;
//# sourceMappingURL=error.middleware.js.map