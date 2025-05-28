import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prompt } from './prompt.entity';
import { Project } from '../projects/projects.entity';
import { PromptRequestModel } from './dto/prompt.request.model';
import { PromptUpdateModel } from './dto/prompt.update.model';

@Injectable()
export class PromptsService {
  constructor(
    @InjectRepository(Prompt)
    private promptsRepository: Repository<Prompt>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async findAll(): Promise<Prompt[]> {
    try {
      const prompts = await this.promptsRepository.find({
        order: {
          createdAt: 'DESC',
        },
      });

      if (!prompts.length) {
        throw new NotFoundException('No prompts found');
      }

      return prompts;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch prompts');
    }
  }

  async findOne(id: number): Promise<Prompt> {
    try {
      const prompt = await this.promptsRepository.findOne({
        where: { id },
        relations: ['project'],
      });

      if (!prompt) {
        throw new NotFoundException(`Prompt with ID ${id} not found`);
      }

      return prompt;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch prompt');
    }
  }

  async findByProjectId(projectId: number): Promise<Prompt[]> {
    try {
      const project = await this.projectsRepository.findOne({
        where: { id: projectId },
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      const prompts = await this.promptsRepository.find({
        where: { projectId },
        relations: ['project'],
        order: {
          createdAt: 'DESC',
        },
      });

      if (!prompts.length) {
        throw new NotFoundException(
          `No prompts found for project ${projectId}`,
        );
      }

      return prompts;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch prompts for project',
      );
    }
  }

  async create(prompt: PromptRequestModel): Promise<Prompt> {
    try {
      if (prompt.projectId) {
        const project = await this.projectsRepository.findOne({
          where: { id: prompt.projectId },
        });

        if (!project) {
          throw new NotFoundException(
            `Project with ID ${prompt.projectId} not found`,
          );
        }
      }

      const newPrompt = this.promptsRepository.create(prompt);
      const savedPrompt = await this.promptsRepository.save(newPrompt);

      if (!savedPrompt) {
        throw new InternalServerErrorException('Failed to create prompt');
      }

      return this.findOne(savedPrompt.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create prompt');
    }
  }

  async update(id: number, prompt: PromptUpdateModel): Promise<Prompt> {
    try {
      const existingPrompt = await this.findOne(id);

      if (prompt.projectId && prompt.projectId !== existingPrompt.projectId) {
        const project = await this.projectsRepository.findOne({
          where: { id: prompt.projectId },
        });

        if (!project) {
          throw new NotFoundException(
            `Project with ID ${prompt.projectId} not found`,
          );
        }
      }

      const updateResult = await this.promptsRepository.update(id, {
        ...prompt,
        updatedAt: new Date(),
      });

      if (updateResult.affected === 0) {
        throw new BadRequestException(`Failed to update prompt with ID ${id}`);
      }

      return this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update prompt');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.findOne(id);

      const deleteResult = await this.promptsRepository.delete(id);

      if (deleteResult.affected === 0) {
        throw new BadRequestException(`Failed to delete prompt with ID ${id}`);
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete prompt');
    }
  }
}
