import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { Prompt } from './prompt.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('prompts')
@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new prompt' })
  @ApiResponse({ status: 201, description: 'The prompt has been successfully created.', type: Prompt })
  create(@Body() prompt: Partial<Prompt>) {
    return this.promptsService.create(prompt);
  }

  @Get()
  @ApiOperation({ summary: 'Get all prompts' })
  @ApiResponse({ status: 200, description: 'Return all prompts.', type: [Prompt] })
  findAll() {
    return this.promptsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a prompt by id' })
  @ApiResponse({ status: 200, description: 'Return the prompt.', type: Prompt })
  findOne(@Param('id') id: string) {
    return this.promptsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a prompt' })
  @ApiResponse({ status: 200, description: 'The prompt has been successfully updated.', type: Prompt })
  update(@Param('id') id: string, @Body() prompt: Partial<Prompt>) {
    return this.promptsService.update(+id, prompt);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a prompt' })
  @ApiResponse({ status: 200, description: 'The prompt has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.promptsService.remove(+id);
  }
} 