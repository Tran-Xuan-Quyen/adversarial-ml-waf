import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserCreateModel } from './dto/user.create.model';
import { UserUpdateModel } from './dto/user.update.model';

@ApiTags('users')
@ApiBearerAuth()

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.', type: [User] })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search user by email' })
  @ApiResponse({ status: 200, description: 'Return the user.', type: User })
  async findByEmail(@Query('email') email: string): Promise<User> {
    return this.usersService.findByEmail(email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'Return the user.', type: User })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: User })
  async create(@Body() user: UserCreateModel): Promise<User> {
    return this.usersService.create(user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.', type: User })
  async update(@Param('id') id: string, @Body() user: UserUpdateModel): Promise<User> {
    return this.usersService.update(+id, user);
  }
}
