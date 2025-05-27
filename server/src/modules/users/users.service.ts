import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { UserUpdateModel } from './dto/user.update.model';
import { UserRequestModel } from './dto/user.request.model';
import { UserProject } from '../user-projects/user-projects.entity';
import { Project } from '../projects/projects.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserProject)
    private userProjectsRepository: Repository<UserProject>,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find({
      relations: ['role', 'project'],
    });
    if (!users.length) {
      throw new NotFoundException('No user found, please try again');
    }
    return users;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('No user found, please try again');
    }

    // Get additional projects from user_projects
    const additionalProjects = await this.getProjectsByUserId(id);
    return {
      ...user,
      projects: [
        ...(user.project ? [user.project] : []),
        ...additionalProjects,
      ],
    };
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('No user found, please try again');
    }
    const additionalProjects = await this.getProjectsByUserId(user.id);
    return {
      ...user,
      projects: [
        ...(user.project ? [user.project] : []),
        ...additionalProjects,
      ],
    };
  }

  async create(user: UserRequestModel): Promise<User> {
    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async update(id: number, user: UserUpdateModel): Promise<User> {
    const userToUpdate = await this.findOne(id);
    try {
      return await this.usersRepository.save({ ...userToUpdate, ...user });
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    const userProjects = await this.userProjectsRepository.find({
      where: { user_id: userId },
      relations: ['project'],
    });
    return userProjects.map((up) => up.project);
  }
}
