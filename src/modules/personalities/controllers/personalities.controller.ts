import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PersonalitiesService } from '../services/personalities.service';
import { CreatePersonalityDto } from '../dto/create-personality.dto';
import { UpdatePersonalityDto } from '../dto/update-personality.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('users/:userId/personalities')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class PersonalitiesController {
  constructor(private readonly personalitiesService: PersonalitiesService) {}

  @Post()
  create(
    @Param('userId') userId: string,
    @Body() createPersonalityDto: CreatePersonalityDto,
  ) {
    return this.personalitiesService.create(userId, createPersonalityDto);
  }

  @Get()
  findAll(@Param('userId') userId: string) {
    return this.personalitiesService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('userId') userId: string, @Param('id') id: string) {
    return this.personalitiesService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Body() updatePersonalityDto: UpdatePersonalityDto,
  ) {
    return this.personalitiesService.update(userId, id, updatePersonalityDto);
  }

  @Delete(':id')
  remove(@Param('userId') userId: string, @Param('id') id: string) {
    return this.personalitiesService.remove(userId, id);
  }
}