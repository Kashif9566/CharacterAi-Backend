import { PrismaService } from '../../../prisma/prisma.service';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { UpdateConversationDto } from '../dto/update-conversation.dto';
export declare class ConversationsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateConversationDto): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(userId: string): Promise<{
        id: string;
        title: string;
        messageCount: number;
        lastMessage: string;
        lastMessageAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(userId: string, id: string): Promise<{
        id: string;
        title: string;
        messages: {
            id: string;
            content: string;
            response: string | null;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(userId: string, id: string, dto: UpdateConversationDto): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
