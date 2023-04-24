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
exports.SaveFcmTokenDto = exports.ConfirmCurrentPasswordDto = exports.ResetPasswordTokenDto = exports.EmailVerifyTokenDto = void 0;
const class_validator_1 = require("class-validator");
class EmailVerifyTokenDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EmailVerifyTokenDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], EmailVerifyTokenDto.prototype, "type", void 0);
exports.EmailVerifyTokenDto = EmailVerifyTokenDto;
class ResetPasswordTokenDto extends EmailVerifyTokenDto {
}
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ResetPasswordTokenDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResetPasswordTokenDto.prototype, "password", void 0);
exports.ResetPasswordTokenDto = ResetPasswordTokenDto;
class ConfirmCurrentPasswordDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmCurrentPasswordDto.prototype, "currentPassword", void 0);
exports.ConfirmCurrentPasswordDto = ConfirmCurrentPasswordDto;
class SaveFcmTokenDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SaveFcmTokenDto.prototype, "token", void 0);
exports.SaveFcmTokenDto = SaveFcmTokenDto;
//# sourceMappingURL=verification.dto.js.map