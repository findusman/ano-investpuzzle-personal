"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const exceptions_1 = require("_app/exceptions");
function validationMiddlewareArray(type, skipMissingProperties = false, whitelist = false) {
    return (req, res, next) => {
        var requestBody = req.body;
        // console.log(requestBody);
        req.body.forEach((currentBody) => {
            console.log(currentBody);
            (0, class_validator_1.validate)((0, class_transformer_1.plainToClass)(type, currentBody), {
                skipMissingProperties,
                whitelist,
                forbidNonWhitelisted: true,
            }).then((errors) => {
                try {
                    if (errors.length > 0) {
                        // const message = errors.map((error: ValidationError) => Object.values(error.constraints));
                        const msg = Object.values(errors[0].constraints)[0];
                        next(new exceptions_1.HttpException(400, msg));
                    }
                    else {
                        next();
                    }
                }
                catch (error) {
                    next(new exceptions_1.HttpException(400, "Bad request"));
                }
            });
        });
    };
}
exports.default = validationMiddlewareArray;
//# sourceMappingURL=validationArray.middleware.js.map