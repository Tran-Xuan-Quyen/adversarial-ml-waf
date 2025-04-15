import {
  Controller,
  Res,
  Post,
  HttpStatus,
  Body,
  NotFoundException,
  Get,
  Headers,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthenticationService } from './authentication.service';
import { LoginRequest } from './dto/login.request.model';
import { plainToInstance } from 'class-transformer';
import { TokensResponseModel } from '../token/dto/tokens.response.model';
import { AccountRegisterModel } from './dto/account.register.model';
import { DecodeTokenRequest } from './dto/decode.request.model';

@ApiTags('Authentication Controllers')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}
  @Post('register')
  async register(@Body() register: AccountRegisterModel, @Res() res: Response) {
    await this.authService.register(register);
    return res.status(HttpStatus.CREATED).json('register successfully');
  }
  @Post('login')
  async login(@Body() login: LoginRequest, @Res() res: Response) {
    const loginResult = await this.authService.login(login);
    if (!loginResult) {
      throw new NotFoundException('Login failed');
    }
    const result = plainToInstance(TokensResponseModel, loginResult);
    return res.status(HttpStatus.OK).json(result);
  }
  @Get('validate')
  @ApiBearerAuth() // Chỉ ra rằng API này yêu cầu Bearer token
  async validateToken(
    @Headers('Authorization') authHeader: string,
    @Res() res: Response,
  ) {
    if (!authHeader) {
      throw new NotFoundException('No token provided');
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new NotFoundException('Invalid token format');
    }
    const result = await this.authService.validateToken(token);
    if (!result) {
      throw new NotFoundException('Invalid token');
    }
    return res.status(HttpStatus.OK).json(result);
  }
  @Post('decode')
  async decodeToken(@Body() data: DecodeTokenRequest, @Res() res: Response) {
    if (!data) {
      throw new UnauthorizedException();
    }
    const result = await this.authService.validateToken(data.token);
    if (!result) {
      throw new NotFoundException('Invalid token');
    }
    return res.status(HttpStatus.OK).json(result);
  }
  @Post('refresh-token')
  async refreshToken(
    @Body('refresh_token') refresh_token: string,
    @Res() res: Response,
  ) {
    if (!refresh_token) {
      throw new NotFoundException('No refresh_token provided');
    }
    const refreshTokenResult =
      await this.authService.refreshToken(refresh_token);
    if (!refreshTokenResult) {
      throw new BadRequestException('Failed to refresh token');
    }
    return res.status(HttpStatus.OK).json(refreshTokenResult);
  }
}
