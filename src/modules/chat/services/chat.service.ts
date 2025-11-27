import { Injectable, Logger, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';
import { AiService } from '../../ai/services/ai.service';
import { SendMessageDto } from '../dto/send-message.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  /**
   * Get or create default conversation for user
   */
  private async getOrCreateDefaultConversation(userId: string) {
    // Try to find existing conversation
    let conversation = await this.prisma.conversation.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    // Create one if it doesn't exist
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

  /**
   * Send a message and get AI response
   */
  async sendMessage(userId: string, dto: SendMessageDto, conversationId?: string) {
    try {
      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      this.logger.log(`User ${user.name} sending message: ${dto.content.substring(0, 50)}...`);

      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await this.prisma.conversation.findUnique({
          where: { id: conversationId, userId },
        });
        if (!conversation) {
          throw new NotFoundException('Conversation not found');
        }
      } else {
        conversation = await this.getOrCreateDefaultConversation(userId);
      }

      // Generate AI response based on user's personality
      const aiResponse = await this.aiService.generateResponse(userId, dto.content);

      // Save message and response to database
      const message = await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: dto.content,
          response: aiResponse,
        },
      });

      // Update conversation's updatedAt timestamp
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
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`, error.stack);
      
      // Handle rate limiting errors
      if (error.message && error.message.includes('429')) {
        throw new HttpException(
          'Rate limit exceeded. Please wait a moment before sending another message.',
          HttpStatus.TOO_MANY_REQUESTS
        );
      }
      
      // Handle other API errors
      if (error.message && error.message.includes('Provider returned error')) {
        throw new HttpException(
          'AI service is temporarily unavailable. Please try again in a moment.',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
      
      throw error;
    }
  }

  /**
   * Send a message and stream AI response
   */
  async sendMessageStream(userId: string, dto: SendMessageDto, res: Response, conversationId?: string) {
    try {
      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      this.logger.log(`User ${user.name} sending streaming message: ${dto.content.substring(0, 50)}...`);

      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await this.prisma.conversation.findUnique({
          where: { id: conversationId, userId },
        });
        if (!conversation) {
          throw new NotFoundException('Conversation not found');
        }
      } else {
        conversation = await this.getOrCreateDefaultConversation(userId);
      }

      // Send conversation ID first
      res.write(`data: ${JSON.stringify({ type: 'conversationId', conversationId: conversation.id })}\n\n`);

      // Stream AI response
      let fullResponse = '';
      for await (const chunk of this.aiService.generateResponseStream(userId, dto.content)) {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      }

      // Save message and response to database
      const message = await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: dto.content,
          response: fullResponse,
        },
      });

      // Update conversation's updatedAt timestamp
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });

      // Send completion event with message ID
      res.write(`data: ${JSON.stringify({
        type: 'done',
        messageId: message.id,
        createdAt: message.createdAt
      })}\n\n`);

      this.logger.log(`Streaming message saved with ID: ${message.id}`);
      res.end();
    } catch (error) {
      this.logger.error(`Error streaming message: ${error.message}`, error.stack);
      
      // Handle rate limiting errors
      if (error.message && error.message.includes('429')) {
        res.write(`data: ${JSON.stringify({
          type: 'error',
          message: 'Rate limit exceeded. Please wait a moment before sending another message.'
        })}\n\n`);
      } else if (error.message && error.message.includes('Provider returned error')) {
        res.write(`data: ${JSON.stringify({
          type: 'error',
          message: 'AI service is temporarily unavailable. Please try again in a moment.'
        })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({
          type: 'error',
          message: error.message || 'An error occurred'
        })}\n\n`);
      }
      
      res.end();
    }
  }

  /**
   * Get chat history for a user (from default conversation)
   */
  async getHistory(userId: string, limit: number = 50) {
    try {
      // Get the default conversation
      const conversation = await this.getOrCreateDefaultConversation(userId);

      const messages = await this.prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      // Return in chronological order (oldest first)
      return messages.reverse().map(msg => ({
        id: msg.id,
        content: msg.content,
        response: msg.response,
        createdAt: msg.createdAt,
      }));
    } catch (error) {
      this.logger.error(`Error fetching history: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Clear chat history for a user (delete all conversations)
   */
  async clearHistory(userId: string) {
    try {
      const result = await this.prisma.conversation.deleteMany({
        where: { userId },
      });

      this.logger.log(`Cleared ${result.count} conversations for user ${userId}`);

      return {
        message: 'Chat history cleared successfully',
        deletedCount: result.count,
      };
    } catch (error) {
      this.logger.error(`Error clearing history: ${error.message}`, error.stack);
      throw error;
    }
  }
}