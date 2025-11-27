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
exports.PersonalitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let PersonalitiesService = class PersonalitiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createPersonalityDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const personality = await this.prisma.personality.create({
            data: {
                userId,
                trait: createPersonalityDto.trait,
                description: createPersonalityDto.description,
                examples: createPersonalityDto.examples || [],
            },
        });
        return personality;
    }
    async findAll(userId) {
        const personalities = await this.prisma.personality.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return personalities;
    }
    async findOne(userId, id) {
        const personality = await this.prisma.personality.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!personality) {
            throw new common_1.NotFoundException('Personality not found');
        }
        return personality;
    }
    async update(userId, id, updatePersonalityDto) {
        const existing = await this.prisma.personality.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Personality not found');
        }
        const personality = await this.prisma.personality.update({
            where: { id },
            data: updatePersonalityDto,
        });
        return personality;
    }
    async remove(userId, id) {
        const personality = await this.prisma.personality.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!personality) {
            throw new common_1.NotFoundException('Personality not found');
        }
        await this.prisma.personality.delete({
            where: { id },
        });
        return { message: 'Personality deleted successfully' };
    }
};
exports.PersonalitiesService = PersonalitiesService;
exports.PersonalitiesService = PersonalitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PersonalitiesService);
//# sourceMappingURL=personalities.service.js.map