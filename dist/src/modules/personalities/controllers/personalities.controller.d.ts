import { PersonalitiesService } from '../services/personalities.service';
import { CreatePersonalityDto } from '../dto/create-personality.dto';
import { UpdatePersonalityDto } from '../dto/update-personality.dto';
export declare class PersonalitiesController {
    private readonly personalitiesService;
    constructor(personalitiesService: PersonalitiesService);
    create(userId: string, createPersonalityDto: CreatePersonalityDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        trait: string;
        description: string;
        examples: string[];
    }>;
    findAll(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        trait: string;
        description: string;
        examples: string[];
    }[]>;
    findOne(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        trait: string;
        description: string;
        examples: string[];
    }>;
    update(userId: string, id: string, updatePersonalityDto: UpdatePersonalityDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        trait: string;
        description: string;
        examples: string[];
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
