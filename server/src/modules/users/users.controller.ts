import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserUpdateModel } from './dto/user.update.model';
import { UserResponseModel } from './dto/user.response.model';
import { UserRequestModel } from './dto/user.request.model';
import { plainToInstance } from 'class-transformer';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Return all users.',
    type: [UserResponseModel],
  })
  async findAll() {
    console.log(`[P]:::Get all users data`);
    const users = await this.usersService.findAll();
    let result = plainToInstance(UserResponseModel, users);
    return result;
  }

  @Get('search')
  @ApiOperation({ summary: 'Search user by email' })
  @ApiResponse({
    status: 200,
    description: 'Return the user.',
    type: UserResponseModel,
  })
  async findByEmail(@Query('email') email: string) {
    console.log(`[P]:::Search user by email: ${email}`);
    const user = await this.usersService.findByEmail(email);
    let result = plainToInstance(UserResponseModel, user);
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the user.',
    type: UserResponseModel,
  })
  async findOne(@Param('id') id: string) {
    console.log(`[P]:::Get user by id: ${id}`);
    const user = await this.usersService.findOne(+id);
    let result = plainToInstance(UserResponseModel, user);
    return result;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: UserResponseModel,
  })
  async create(@Body() user: UserRequestModel) {
    console.log(`[P]:::Create user: ${user}`);
    const newUser = await this.usersService.create(user);
    let result = plainToInstance(UserResponseModel, newUser);
    return result;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
    type: UserResponseModel,
  })
  async update(@Param('id') id: string, @Body() user: UserUpdateModel) {
    console.log(`[P]:::Update user: ${id} with ${user}`);
    const updatedUser = await this.usersService.update(+id, user);
    let result = plainToInstance(UserResponseModel, updatedUser);
    return result;
  }
}
