"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessCodeCheckDto = exports.UserNameEmailCheckDto = void 0;
const class_validator_1 = require("class-validator");
const utils_1 = require("_app/utils");
class UserNameEmailCheckDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(utils_1.userNameRegex, { message: "Invalid username" }),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(32),
    __metadata("design:type", String)
], UserNameEmailCheckDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UserNameEmailCheckDto.prototype, "email", void 0);
exports.UserNameEmailCheckDto = UserNameEmailCheckDto;
class AccessCodeCheckDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], AccessCodeCheckDto.prototype, "accesscode", void 0);
exports.AccessCodeCheckDto = AccessCodeCheckDto;
//# sourceMappingURL=userNameEmailCheck.dto.js.map