import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prompt } from './prompt.entity';

@Injectable()
export class PromptsService {
  constructor(
    @InjectRepository(Prompt)
    private promptsRepository: Repository<Prompt>,
  ) {}

  async findAll(): Promise<Prompt[]> {
    return this.promptsRepository.find();
  }

  async findOne(id: number): Promise<Prompt | null> {
    return await this.promptsRepository.findOne({ where: { id } });
  }

  async create(prompt: Partial<Prompt>): Promise<Prompt> {
    const newPrompt = this.promptsRepository.create(prompt);
    return this.promptsRepository.save(newPrompt);
  }

  async update(id: number, prompt: Partial<Prompt>): Promise<Prompt> {
    await this.promptsRepository.update(id, prompt);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error(`Prompt with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.promptsRepository.delete(id);
  }
} 