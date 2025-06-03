import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { Prompt } from './prompt.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PromptResponseModel } from './dto/prompt.response.model';
import { PromptRequestModel } from './dto/prompt.request.model';
import { plainToInstance } from 'class-transformer';

@ApiTags('prompts')
@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new prompt' })
  @ApiResponse({
    status: 201,
    description: 'The prompt has been successfully created.',
    type: PromptResponseModel,
  })
  async create(@Body() prompt: PromptRequestModel) {
    console.log(`[P]:::Create a new prompt`, prompt);
    const promptResponse = await this.promptsService.create(prompt);
    let result = plainToInstance(PromptResponseModel, promptResponse);
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'Get all prompts' })
  @ApiResponse({
    status: 200,
    description: 'Return all prompts.',
    type: [PromptResponseModel],
  })
  async findAll() {
    console.log(`[P]:::Get all prompts`);
    const prompts = await this.promptsService.findAll();
    let result = plainToInstance(PromptResponseModel, prompts);
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a prompt by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the prompt.',
    type: PromptResponseModel,
  })
  async findOne(@Param('id') id: string) {
    console.log(`[P]:::Get a prompt by id: ${id}`);
    const prompt = await this.promptsService.findOne(+id);
    let result = plainToInstance(PromptResponseModel, prompt);
    return result;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a prompt' })
  @ApiResponse({
    status: 200,
    description: 'The prompt has been successfully updated.',
    type: PromptResponseModel,
  })
  async update(@Param('id') id: string, @Body() prompt: Partial<Prompt>) {
    console.log(`[P]:::Update a prompt: ${id}`, prompt);
    const promptResponse = await this.promptsService.update(+id, prompt);
    let result = plainToInstance(PromptResponseModel, promptResponse);
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a prompt' })
  @ApiResponse({
    status: 200,
    description: 'The prompt has been successfully deleted.',
  })
  async remove(@Param('id') id: string) {
    console.log(`[P]:::Delete a prompt: ${id}`);
    await this.promptsService.remove(+id);
    return { message: 'Prompt deleted successfully' };
  }
}
