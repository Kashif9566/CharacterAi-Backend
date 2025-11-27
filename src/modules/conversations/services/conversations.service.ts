import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { UpdateConversationDto } from '../dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new conversation
   */
  async create(userId: string, dto: CreateConversationDto) {
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

  /**
   * Get all conversations for a user
   */
  async findAll(userId: string) {
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

  /**
   * Get a single conversation with messages
   */
  async findOne(userId: string, id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('Access denied');
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

  /**
   * Update a conversation
   */
  async update(userId: string, id: string, dto: UpdateConversationDto) {
    // Verify ownership
    const existing = await this.prisma.conversation.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Conversation not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Access denied');
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

  /**
   * Delete a conversation
   */
  async remove(userId: string, id: string) {
    // Verify ownership
    const existing = await this.prisma.conversation.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Conversation not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.conversation.delete({
      where: { id },
    });

    this.logger.log(`Deleted conversation ${id}`);

    return {
      message: 'Conversation deleted successfully',
    };
  }
}