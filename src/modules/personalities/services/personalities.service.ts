import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePersonalityDto } from '../dto/create-personality.dto';
import { UpdatePersonalityDto } from '../dto/update-personality.dto';

@Injectable()
export class PersonalitiesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPersonalityDto: CreatePersonalityDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create personality
    const personality = await this.prisma.personality.create({
      data: {
        userId,
        trait: createPersonalityDto.trait,
        description: createPersonalityDto.description,
        examples: createPersonalityDto.examples || [],
      },
    });

    return personality;
  }

  async findAll(userId: string) {
    const personalities = await this.prisma.personality.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return personalities;
  }

  async findOne(userId: string, id: string) {
    const personality = await this.prisma.personality.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!personality) {
      throw new NotFoundException('Personality not found');
    }

    return personality;
  }

  async update(userId: string, id: string, updatePersonalityDto: UpdatePersonalityDto) {
    // Check if personality exists and belongs to user
    const existing = await this.prisma.personality.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Personality not found');
    }

    // Update personality
    const personality = await this.prisma.personality.update({
      where: { id },
      data: updatePersonalityDto,
    });

    return personality;
  }

  async remove(userId: string, id: string) {
    // Check if personality exists and belongs to user
    const personality = await this.prisma.personality.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!personality) {
      throw new NotFoundException('Personality not found');
    }

    // Delete personality
    await this.prisma.personality.delete({
      where: { id },
    });

    return { message: 'Personality deleted successfully' };
  }
}