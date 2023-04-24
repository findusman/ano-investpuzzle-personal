"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paramsValidator = exports.queryIdValidator = exports.queryMiddleware = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const mongoose_1 = require("mongoose");
const exceptions_1 = require("_app/exceptions");
function queryMiddleware(type, skipMissingProperties = false) {
    return (req, res, next) => {
        (0, class_validator_1.validate)((0, class_transformer_1.plainToClass)(type, req.query), { skipMissingProperties }).then((errors) => {
            try {
                if (errors.length > 0) {
                    const message = errors.map((error) => Object.values(error.constraints)).join(", ");
                    next(new exceptions_1.HttpException(400, message));
                }
                else {
                    next();
                }
            }
            catch (error) {
                next(new exceptions_1.HttpException(400, "Bad request"));
            }
        });
    };
}
exports.queryMiddleware = queryMiddleware;
const queryIdValidator = (object) => {
    return (req, res, next) => {
        if ((0, mongoose_1.isValidObjectId)(req.params.id)) {
            next();
        }
        else {
            next(new exceptions_1.NotFoundException(object));
        }
    };
};
exports.queryIdValidator = queryIdValidator;
const paramsValidator = (args) => {
    return (req, res, next) => {
        const errors = [];
        args.forEach(({ name, validator }) => {
            if (validator && !validator(req.params[name])) {
                errors.push(new exceptions_1.HttpException(400, `Invalid ${name}`));
            }
        });
        if (errors.length > 0) {
            next(errors[0]);
        }
        else {
            next();
        }
    };
};
exports.paramsValidator = paramsValidator;
//# sourceMappingURL=query.middleware.js.map