import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prompt } from './prompt.entity';
import { PromptsService } from './prompts.service';
import { PromptsController } from './prompts.controller';
import { Project } from '../projects/projects.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prompt, Project])],
  providers: [PromptsService],
  controllers: [PromptsController],
  exports: [PromptsService]
})
export class PromptsModule {} 