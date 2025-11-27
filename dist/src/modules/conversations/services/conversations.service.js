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
var ConversationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ConversationsService = ConversationsService_1 = class ConversationsService {
    prisma;
    logger = new common_1.Logger(ConversationsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const conversation = await this.prisma.conversation.create({
            data: {
                userId,
                title: dto.title || 'New Chat',
            },
        });
        this.logger.log(`Created conversation ${conversation.id} for user ${userId}`);
        return {
            id: conversation.id,
            title: conversation.title,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
        };
    }
    async findAll(userId) {
        const conversations = await this.prisma.conversation.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        content: true,
                        createdAt: true,
                    },
                },
                _count: {
                    select: { messages: true },
                },
            },
        });
        return conversations.map(conv => ({
            id: conv.id,
            title: conv.title,
            messageCount: conv._count.messages,
            lastMessage: conv.messages[0]?.content,
            lastMessageAt: conv.messages[0]?.createdAt,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
        }));
    }
    async findOne(userId, id) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return {
            id: conversation.id,
            title: conversation.title,
            messages: conversation.messages.map(msg => ({
                id: msg.id,
                content: msg.content,
                response: msg.response,
                createdAt: msg.createdAt,
            })),
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
        };
    }
    async update(userId, id, dto) {
        const existing = await this.prisma.conversation.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (existing.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const conversation = await this.prisma.conversation.update({
            where: { id },
            data: {
                title: dto.title,
            },
        });
        this.logger.log(`Updated conversation ${id}`);
        return {
            id: conversation.id,
            title: conversation.title,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
        };
    }
    async remove(userId, id) {
        const existing = await this.prisma.conversation.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (existing.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        await this.prisma.conversation.delete({
            where: { id },
        });
        this.logger.log(`Deleted conversation ${id}`);
        return {
            message: 'Conversation deleted successfully',
        };
    }
};
exports.ConversationsService = ConversationsService;
exports.ConversationsService = ConversationsService = ConversationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConversationsService);
//# sourceMappingURL=conversations.service.js.map