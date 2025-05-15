import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prompt } from './prompt.entity';
import { PromptsService } from './prompts.service';
import { PromptsController } from './prompts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Prompt])],
  providers: [PromptsService],
  controllers: [PromptsController],
  exports: [PromptsService]
})
export class PromptsModule {} 