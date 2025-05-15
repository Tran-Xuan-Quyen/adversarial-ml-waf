import { Injectable, NotFoundException } from '@nestjs/common';
import { Project } from './projects.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectsCreateModel } from './dto/projects.create.model';
import { ProjectsUpdateModel } from './dto/projects.update.model';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.find();
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async create(createProjectDto: ProjectsCreateModel): Promise<Project> {
    const project = this.projectsRepository.create(createProjectDto);
    return this.projectsRepository.save(project);
  }

  async update(
    id: number,
    updateProjectDto: ProjectsUpdateModel,
  ): Promise<Project> {
    const project = await this.findOne(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return this.projectsRepository.save({ ...project, ...updateProjectDto });
  }
}
