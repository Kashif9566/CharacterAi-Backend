import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
export declare class AiService {
    private configService;
    private prisma;
    private readonly logger;
    private openai;
    constructor(configService: ConfigService, prisma: PrismaService);
    generateResponseStream(userId: string, userMessage: string): AsyncGenerator<string>;
    generateResponse(userId: string, userMessage: string): Promise<string>;
    private buildSystemPrompt;
    testConnection(): Promise<boolean>;
}
