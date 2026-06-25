import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Project } from './projects.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectsRequestModel } from './dto/projects.request.model';
import { ProjectsUpdateModel } from './dto/projects.update.model';
import { ProjectsListFilters } from './dto/projects-list.filters';
import { UserProject } from '../user-projects/user-projects.entity';
import { User } from '../users/users.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(UserProject)
    private userProjectsRepository: Repository<UserProject>,
  ) {}

  private decodeBypassPayload(name: string): string {
    if (!name) return name;

    let cleanName = name;
    try {
      let decodedName = cleanName;
      while (decodedName.includes('%')) {
        const nextDecoded = decodeURIComponent(decodedName);
        if (nextDecoded === decodedName) {
          break;
        }
        decodedName = nextDecoded;
      }
      cleanName = decodedName;
    } catch (e) {
      // Ignore URL decoding errors to keep partial progress
    }

    cleanName = cleanName.replace(/\0/g, '').replace(/%00/g, '');

    // Replace hex segments by matching groups of exactly 2 hex digits (bytes)
    cleanName = cleanName.replace(
      /(0x|[xX])((?:[0-9a-fA-F]{2})+)/g,
      (match, prefix, hex) => {
        try {
          let decoded = Buffer.from(hex, 'hex').toString('utf-8');
          return decoded.replace(/#/g, ' ');
        } catch (e) {
          return match;
        }
      },
    );

    return cleanName;
  }

  async findAll(filters?: ProjectsListFilters): Promise<Project[]> {
    try {
      const where: Record<string, unknown> = {};
      if (filters?.projectName !== undefined && filters.projectName !== '') {
        where.projectName = this.decodeBypassPayload(filters.projectName);
      }
      if (
        filters?.applicationDomain !== undefined &&
        filters.applicationDomain !== ''
      ) {
        where.applicationDomain = filters.applicationDomain;
      }

      const projects = await this.projectsRepository.find({
        where,
      });
      if (!projects.length) {
        throw new NotFoundException('No project found, please try again');
      }
      return projects;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch projects: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private mapProjectRow(row: Record<string, unknown>): Project {
    const p = new Project();
    p.id = Number(row.id);
    p.projectName = String(row.project_name ?? '');
    p.applicationDomain = String(row.application_domain ?? '');
    p.description =
      row.description != null && row.description !== ''
        ? String(row.description)
        : '';
    p.createdAt = row.created_at as Date;
    p.updatedAt = row.updated_at as Date;
    p.users = [];
    p.domains = [];
    p.prompts = [];
    return p;
  }

  async findOne(id: number): Promise<Project> {
    try {
      const project = await this.projectsRepository.findOne({
        where: { id },
      });
      if (!project) {
        throw new NotFoundException('No project found, please try again');
      }

      const additionalUsers = await this.getUsersByProjectId(id);
      return {
        ...project,
        users: [...(project.users || []), ...additionalUsers],
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch project: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async create(createProjectDto: ProjectsRequestModel): Promise<Project> {
    try {
      const project = this.projectsRepository.create(createProjectDto);
      return await this.projectsRepository.save(project);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create project: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async update(
    id: number,
    updateProjectDto: ProjectsUpdateModel,
  ): Promise<Project> {
    const project = await this.findOne(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    try {
      return this.projectsRepository.save({ ...project, ...updateProjectDto });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update project: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await this.projectsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete project: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getUsersByProjectId(projectId: number): Promise<User[]> {
    try {
      const userProjects = await this.userProjectsRepository.find({
        where: { project_id: projectId },
        relations: ['user'],
      });

      return userProjects.map((up) => up.user);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get users by project ID: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
