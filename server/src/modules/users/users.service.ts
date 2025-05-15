import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { UserCreateModel } from './dto/user.create.model';
import { UserUpdateModel } from './dto/user.update.model';

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

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: [{ email: email }],
      relations: ['role', 'project'],
    });

    if (!user) {
      throw new NotFoundException(
        `User with username/email ${email} not found`,
      );
    }

    return user;
  }

  async create(user: UserCreateModel): Promise<User> {
    return this.usersRepository.save(user);
  }

  async update(id: number, user: UserUpdateModel): Promise<User> {
    const userToUpdate = await this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'project'],
    });
    if (!userToUpdate) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.usersRepository.save({ ...userToUpdate, ...user });
  }
}
