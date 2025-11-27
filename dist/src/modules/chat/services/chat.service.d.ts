import type { Response } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';
import { AiService } from '../../ai/services/ai.service';
import { SendMessageDto } from '../dto/send-message.dto';
export declare class ChatService {
    private prisma;
    private aiService;
    private readonly logger;
    constructor(prisma: PrismaService, aiService: AiService);
    private getOrCreateDefaultConversation;
    sendMessage(userId: string, dto: SendMessageDto, conversationId?: string): Promise<{
        id: string;
        content: string;
        response: string | null;
        createdAt: Date;
    }>;
    sendMessageStream(userId: string, dto: SendMessageDto, res: Response, conversationId?: string): Promise<void>;
    getHistory(userId: string, limit?: number): Promise<{
        id: string;
        content: string;
        response: string | null;
        createdAt: Date;
    }[]>;
    clearHistory(userId: string): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
