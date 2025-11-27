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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
const prisma_service_1 = require("../../../prisma/prisma.service");
let AiService = AiService_1 = class AiService {
    configService;
    prisma;
    logger = new common_1.Logger(AiService_1.name);
    openai;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        const apiKey = this.configService.get('openai.apiKey');
        const baseURL = this.configService.get('openai.baseURL');
        if (!apiKey) {
            this.logger.warn('OpenAI API key not configured');
        }
        this.openai = new openai_1.default({
            apiKey: apiKey || 'dummy-key',
            baseURL: baseURL,
        });
        if (baseURL) {
            this.logger.log(`Using custom base URL: ${baseURL}`);
        }
    }
    async *generateResponseStream(userId, userMessage) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    personalities: true,
                },
            });
            if (!user) {
                throw new Error('User not found');
            }
            const systemPrompt = this.buildSystemPrompt(user.name, user.personalities);
            const model = this.configService.get('openai.model') || 'gpt-4o-mini';
            this.logger.log(`Generating streaming response for user ${user.name} using model ${model}`);
            const stream = await this.openai.chat.completions.create({
                model,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt,
                    },
                    {
                        role: 'user',
                        content: userMessage,
                    },
                ],
                temperature: 0.9,
                max_tokens: 500,
                stream: true,
            });
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    yield content;
                }
            }
            this.logger.log(`Completed streaming response for user ${user.name}`);
        }
        catch (error) {
            this.logger.error(`Error generating streaming AI response: ${error.message}`, error.stack);
            throw error;
        }
    }
    async generateResponse(userId, userMessage) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    personalities: true,
                },
            });
            if (!user) {
                throw new Error('User not found');
            }
            const systemPrompt = this.buildSystemPrompt(user.name, user.personalities);
            const model = this.configService.get('openai.model') || 'gpt-4o-mini';
            this.logger.log(`Generating response for user ${user.name} using model ${model}`);
            const completion = await this.openai.chat.completions.create({
                model,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt,
                    },
                    {
                        role: 'user',
                        content: userMessage,
                    },
                ],
                temperature: 0.9,
                max_tokens: 500,
            });
            const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
            this.logger.log(`Generated response for user ${user.name}`);
            return response;
        }
        catch (error) {
            this.logger.error(`Error generating AI response: ${error.message}`, error.stack);
            throw error;
        }
    }
    buildSystemPrompt(userName, personalities) {
        if (!personalities || personalities.length === 0) {
            return `You are ${userName}. Respond in a helpful and friendly manner.`;
        }
        let prompt = `You are ${userName}. You have the following personality traits that define how you communicate:\n\n`;
        personalities.forEach((personality, index) => {
            prompt += `${index + 1}. ${personality.trait}: ${personality.description}\n`;
            if (personality.examples && personality.examples.length > 0) {
                prompt += `   Examples of how you express this trait:\n`;
                personality.examples.forEach((example) => {
                    prompt += `   - "${example}"\n`;
                });
            }
            prompt += '\n';
        });
        prompt += `IMPORTANT: You MUST respond according to these personality traits in a funny, sarcastic, witty, slightly brutal, and entertaining way. It should not be vulgur. `;
        prompt += `Every response should reflect your unique personality. Stay in character at all times. `;
        prompt += `Be creative, humorous, and make your responses memorable based on your traits. `;
        prompt += `Always use American English style and standard American expressions in your responses.`;
        return prompt;
    }
    async testConnection() {
        try {
            const apiKey = this.configService.get('openai.apiKey');
            if (!apiKey) {
                this.logger.warn('OpenAI API key not configured');
                return false;
            }
            await this.openai.models.list();
            this.logger.log('OpenAI connection successful');
            return true;
        }
        catch (error) {
            this.logger.error(`OpenAI connection failed: ${error.message}`);
            return false;
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], AiService);
//# sourceMappingURL=ai.service.js.map