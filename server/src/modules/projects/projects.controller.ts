import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectsUpdateModel } from './dto/projects.update.model';
import { ProjectsResponseModel } from './dto/projects.response.model';
import { plainToInstance } from 'class-transformer';
import { ProjectsRequestModel } from './dto/projects.request.model';
import { ProjectsListFilters } from './dto/projects-list.filters';
import { UsersService } from '../users/users.service';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all projects, or one project when id query is set',
  })
  @ApiQuery({
    name: 'id',
    required: false,
    description:
      'If set, returns the same as GET /projects/:id (WAF-friendly query form).',
  })
  @ApiQuery({ name: 'projectName', required: false })
  @ApiQuery({ name: 'applicationDomain', required: false })
  @ApiResponse({
    status: 200,
    description: 'Return all projects, or one project when id is provided.',
    type: [ProjectsResponseModel],
  })
  async findAll(
    @Query('id') id?: string,
    @Query('projectName') projectName?: string,
    @Query('applicationDomain') applicationDomain?: string,
  ) {
    if (id !== undefined && id !== '') {
      const num = Number(id);
      if (!Number.isInteger(num) || num < 1) {
        throw new BadRequestException('Query id must be a positive integer');
      }
      console.log(`[P]:::Get project by query id: ${num}`);
      const project = await this.projectsService.findOne(num);
      return plainToInstance(ProjectsResponseModel, project);
    }
    let filters: ProjectsListFilters | undefined;
    if (
      (projectName !== undefined && projectName !== '') ||
      (applicationDomain !== undefined && applicationDomain !== '')
    ) {
      filters = {};
      if (projectName !== undefined && projectName !== '') {
        filters.projectName = projectName;
      }
      if (applicationDomain !== undefined && applicationDomain !== '') {
        filters.applicationDomain = applicationDomain;
      }
    }
    console.log(`[P]:::Get projects list`);
    const projects = await this.projectsService.findAll(filters);
    return plainToInstance(ProjectsResponseModel, projects);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the project.',
    type: ProjectsResponseModel,
  })
  async findOne(@Param('id') id: string) {
    console.log(`[P]:::Get project by id: ${id}`);
    const project = await this.projectsService.findOne(+id);
    let result = plainToInstance(ProjectsResponseModel, project);
    return result;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'The project has been successfully created.',
    type: ProjectsResponseModel,
  })
  async create(@Body() createProjectDto: ProjectsRequestModel) {
    console.log(`[P]:::Create project: ${createProjectDto}`);
    const project = await this.projectsService.create(createProjectDto);
    let result = plainToInstance(ProjectsResponseModel, project);
    return result;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project by ID' })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully updated.',
    type: ProjectsResponseModel,
  })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: ProjectsUpdateModel,
  ) {
    console.log(`[P]:::Update project: ${id} with ${updateProjectDto}`);
    const project = await this.projectsService.update(+id, updateProjectDto);
    let result = plainToInstance(ProjectsResponseModel, project);
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project by ID' })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully deleted.',
  })
  async delete(@Param('id') id: string): Promise<void> {
    console.log(`[P]:::Delete project: ${id}`);
    return this.projectsService.delete(+id);
  }
}
