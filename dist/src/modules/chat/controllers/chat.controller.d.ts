import type { Response } from 'express';
import { ChatService } from '../services/chat.service';
import { SendMessageDto } from '../dto/send-message.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    sendMessage(userId: string, dto: SendMessageDto): Promise<{
        id: string;
        content: string;
        response: string | null;
        createdAt: Date;
    }>;
    sendMessageStream(userId: string, dto: SendMessageDto, res: Response): Promise<void>;
    getHistory(userId: string, limit?: string): Promise<{
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
