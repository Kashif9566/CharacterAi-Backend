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
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const ai_service_1 = require("../../ai/services/ai.service");
let ChatService = ChatService_1 = class ChatService {
    prisma;
    aiService;
    logger = new common_1.Logger(ChatService_1.name);
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    async getOrCreateDefaultConversation(userId) {
        let conversation = await this.prisma.conversation.findFirst({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
        if (!conversation) {
            conversation = await this.prisma.conversation.create({
                data: {
                    userId,
                    title: 'New Chat',
                },
            });
        }
        return conversation;
    }
    async sendMessage(userId, dto, conversationId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            this.logger.log(`User ${user.name} sending message: ${dto.content.substring(0, 50)}...`);
            let conversation;
            if (conversationId) {
                conversation = await this.prisma.conversation.findUnique({
                    where: { id: conversationId, userId },
                });
                if (!conversation) {
                    throw new common_1.NotFoundException('Conversation not found');
                }
            }
            else {
                conversation = await this.getOrCreateDefaultConversation(userId);
            }
            const aiResponse = await this.aiService.generateResponse(userId, dto.content);
            const message = await this.prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    content: dto.content,
                    response: aiResponse,
                },
            });
            await this.prisma.conversation.update({
                where: { id: conversation.id },
                data: { updatedAt: new Date() },
            });
            this.logger.log(`Message saved with ID: ${message.id}`);
            return {
                id: message.id,
                content: message.content,
                response: message.response,
                createdAt: message.createdAt,
            };
        }
        catch (error) {
            this.logger.error(`Error sending message: ${error.message}`, error.stack);
            if (error.message && error.message.includes('429')) {
                throw new common_1.HttpException('Rate limit exceeded. Please wait a moment before sending another message.', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            if (error.message && error.message.includes('Provider returned error')) {
                throw new common_1.HttpException('AI service is temporarily unavailable. Please try again in a moment.', common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
            throw error;
        }
    }
    async sendMessageStream(userId, dto, res, conversationId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            this.logger.log(`User ${user.name} sending streaming message: ${dto.content.substring(0, 50)}...`);
            let conversation;
            if (conversationId) {
                conversation = await this.prisma.conversation.findUnique({
                    where: { id: conversationId, userId },
                });
                if (!conversation) {
                    throw new common_1.NotFoundException('Conversation not found');
                }
            }
            else {
                conversation = await this.getOrCreateDefaultConversation(userId);
            }
            res.write(`data: ${JSON.stringify({ type: 'conversationId', conversationId: conversation.id })}\n\n`);
            let fullResponse = '';
            for await (const chunk of this.aiService.generateResponseStream(userId, dto.content)) {
                fullResponse += chunk;
                res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
            }
            const message = await this.prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    content: dto.content,
                    response: fullResponse,
                },
            });
            await this.prisma.conversation.update({
                where: { id: conversation.id },
                data: { updatedAt: new Date() },
            });
            res.write(`data: ${JSON.stringify({
                type: 'done',
                messageId: message.id,
                createdAt: message.createdAt
            })}\n\n`);
            this.logger.log(`Streaming message saved with ID: ${message.id}`);
            res.end();
        }
        catch (error) {
            this.logger.error(`Error streaming message: ${error.message}`, error.stack);
            if (error.message && error.message.includes('429')) {
                res.write(`data: ${JSON.stringify({
                    type: 'error',
                    message: 'Rate limit exceeded. Please wait a moment before sending another message.'
                })}\n\n`);
            }
            else if (error.message && error.message.includes('Provider returned error')) {
                res.write(`data: ${JSON.stringify({
                    type: 'error',
                    message: 'AI service is temporarily unavailable. Please try again in a moment.'
                })}\n\n`);
            }
            else {
                res.write(`data: ${JSON.stringify({
                    type: 'error',
                    message: error.message || 'An error occurred'
                })}\n\n`);
            }
            res.end();
        }
    }
    async getHistory(userId, limit = 50) {
        try {
            const conversation = await this.getOrCreateDefaultConversation(userId);
            const messages = await this.prisma.message.findMany({
                where: { conversationId: conversation.id },
                orderBy: { createdAt: 'desc' },
                take: limit,
            });
            return messages.reverse().map(msg => ({
                id: msg.id,
                content: msg.content,
                response: msg.response,
                createdAt: msg.createdAt,
            }));
        }
        catch (error) {
            this.logger.error(`Error fetching history: ${error.message}`, error.stack);
            throw error;
        }
    }
    async clearHistory(userId) {
        try {
            const result = await this.prisma.conversation.deleteMany({
                where: { userId },
            });
            this.logger.log(`Cleared ${result.count} conversations for user ${userId}`);
            return {
                message: 'Chat history cleared successfully',
                deletedCount: result.count,
            };
        }
        catch (error) {
            this.logger.error(`Error clearing history: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], ChatService);
//# sourceMappingURL=chat.service.js.map