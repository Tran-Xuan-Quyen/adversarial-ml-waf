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
  create(@Body() prompt: PromptRequestModel) {
    return this.promptsService.create(prompt);
  }

  @Get()
  @ApiOperation({ summary: 'Get all prompts' })
  @ApiResponse({
    status: 200,
    description: 'Return all prompts.',
    type: [PromptResponseModel],
  })
  findAll() {
    return this.promptsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a prompt by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the prompt.',
    type: PromptResponseModel,
  })
  findOne(@Param('id') id: string) {
    return this.promptsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a prompt' })
  @ApiResponse({
    status: 200,
    description: 'The prompt has been successfully updated.',
    type: PromptResponseModel,
  })
  update(@Param('id') id: string, @Body() prompt: Partial<Prompt>) {
    return this.promptsService.update(+id, prompt);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a prompt' })
  @ApiResponse({
    status: 200,
    description: 'The prompt has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.promptsService.remove(+id);
  }
}
