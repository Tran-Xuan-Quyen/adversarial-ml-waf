import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['role', 'project'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'project'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: [
        { email: usernameOrEmail }
      ],
      relations: ['role', 'project'],
    });

    if (!user) {
      throw new NotFoundException(`User with username/email ${usernameOrEmail} not found`);
    }

    return user;
  }
}
