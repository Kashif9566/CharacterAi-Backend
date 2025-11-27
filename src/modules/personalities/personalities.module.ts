import { Module } from '@nestjs/common';
import { PersonalitiesService } from './services/personalities.service';
import { PersonalitiesController } from './controllers/personalities.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PersonalitiesController],
  providers: [PersonalitiesService],
  exports: [PersonalitiesService],
})
export class PersonalitiesModule {}