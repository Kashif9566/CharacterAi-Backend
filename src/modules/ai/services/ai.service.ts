import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('openai.apiKey');
    const baseURL = this.configService.get<string>('openai.baseURL');
    
    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey || 'dummy-key',
      baseURL: baseURL,
    });
    
    if (baseURL) {
      this.logger.log(`Using custom base URL: ${baseURL}`);
    }
  }

  /**
   * Generate AI response based on user's personality traits (streaming)
   */
  async *generateResponseStream(userId: string, userMessage: string): AsyncGenerator<string> {
    try {
      // Get user with their personality traits
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          personalities: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Build system prompt with personality traits
      const systemPrompt = this.buildSystemPrompt(user.name, user.personalities);

      // Call OpenAI API with streaming
      const model = this.configService.get<string>('openai.model') || 'gpt-4o-mini';
      
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
        stream: true, // Enable streaming
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
      
      this.logger.log(`Completed streaming response for user ${user.name}`);
    } catch (error) {
      this.logger.error(`Error generating streaming AI response: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate AI response based on user's personality traits (non-streaming)
   */
  async generateResponse(userId: string, userMessage: string): Promise<string> {
    try {
      // Get user with their personality traits
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          personalities: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Build system prompt with personality traits
      const systemPrompt = this.buildSystemPrompt(user.name, user.personalities);

      // Call OpenAI API
      const model = this.configService.get<string>('openai.model') || 'gpt-4o-mini';
      
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
        temperature: 0.9, // Higher temperature for more creative/funny responses
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      
      this.logger.log(`Generated response for user ${user.name}`);
      
      return response;
    } catch (error) {
      this.logger.error(`Error generating AI response: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Build system prompt with user's personality traits
   */
  private buildSystemPrompt(userName: string, personalities: any[]): string {
    if (!personalities || personalities.length === 0) {
      return `You are ${userName}. Respond in a helpful and friendly manner.`;
    }

    let prompt = `You are ${userName}. You have the following personality traits that define how you communicate:\n\n`;

    personalities.forEach((personality, index) => {
      prompt += `${index + 1}. ${personality.trait}: ${personality.description}\n`;
      
      if (personality.examples && personality.examples.length > 0) {
        prompt += `   Examples of how you express this trait:\n`;
        personality.examples.forEach((example: string) => {
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

  /**
   * Test OpenAI connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const apiKey = this.configService.get<string>('openai.apiKey');
      if (!apiKey) {
        this.logger.warn('OpenAI API key not configured');
        return false;
      }

      await this.openai.models.list();
      this.logger.log('OpenAI connection successful');
      return true;
    } catch (error) {
      this.logger.error(`OpenAI connection failed: ${error.message}`);
      return false;
    }
  }
}