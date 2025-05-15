import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './projects.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectsCreateModel } from './dto/projects.create.model';
import { ProjectsUpdateModel } from './dto/projects.update.model';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({
    status: 200,
    description: 'Return all projects.',
    type: [Project],
  })
  async findAll(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the project.',
    type: Project,
  })
  async findOne(@Param('id') id: string): Promise<Project> {
    console.log(id);
    return this.projectsService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'The project has been successfully created.',
    type: Project,
  })
  async create(
    @Body() createProjectDto: ProjectsCreateModel,
  ): Promise<Project> {
    return this.projectsService.create(createProjectDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project by ID' })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully updated.',
    type: Project,
  })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: ProjectsUpdateModel,
  ): Promise<Project> {
    return this.projectsService.update(+id, updateProjectDto);
  }
}
