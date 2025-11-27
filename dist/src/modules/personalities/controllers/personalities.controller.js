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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalitiesController = void 0;
const common_1 = require("@nestjs/common");
const personalities_service_1 = require("../services/personalities.service");
const create_personality_dto_1 = require("../dto/create-personality.dto");
const update_personality_dto_1 = require("../dto/update-personality.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
let PersonalitiesController = class PersonalitiesController {
    personalitiesService;
    constructor(personalitiesService) {
        this.personalitiesService = personalitiesService;
    }
    create(userId, createPersonalityDto) {
        return this.personalitiesService.create(userId, createPersonalityDto);
    }
    findAll(userId) {
        return this.personalitiesService.findAll(userId);
    }
    findOne(userId, id) {
        return this.personalitiesService.findOne(userId, id);
    }
    update(userId, id, updatePersonalityDto) {
        return this.personalitiesService.update(userId, id, updatePersonalityDto);
    }
    remove(userId, id) {
        return this.personalitiesService.remove(userId, id);
    }
};
exports.PersonalitiesController = PersonalitiesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_personality_dto_1.CreatePersonalityDto]),
    __metadata("design:returntype", void 0)
], PersonalitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PersonalitiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PersonalitiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_personality_dto_1.UpdatePersonalityDto]),
    __metadata("design:returntype", void 0)
], PersonalitiesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PersonalitiesController.prototype, "remove", null);
exports.PersonalitiesController = PersonalitiesController = __decorate([
    (0, common_1.Controller)('users/:userId/personalities'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [personalities_service_1.PersonalitiesService])
], PersonalitiesController);
//# sourceMappingURL=personalities.controller.js.map