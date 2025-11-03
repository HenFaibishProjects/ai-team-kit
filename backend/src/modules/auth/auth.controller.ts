import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '../config/config.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    // Return mock user for no-auth mode
    return {
      id: '1',
      email: 'demo@example.com',
      username: 'Demo User',
      organizationName: 'Demo Organization'
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    return { message: 'Logged out successfully' };
  }

  @Get('projects')
  async getUserProjects() {
    // Return projects from config service for default user
    return await this.configService.getUserProjects('default-user');
  }

  @Get('organization/users')
  async getOrganizationUsers() {
    // Return mock users for no-auth mode
    return [
      {
        id: '1',
        email: 'demo@example.com',
        username: 'Demo User',
        organizationName: 'Demo Organization'
      }
    ];
  }

  @Get('users/:userId/projects')
  async getUserProjectsById(@Query('userId') userId: string) {
    // Return projects from config service for specified user
    const effectiveUserId = userId || 'default-user';
    return await this.configService.getUserProjects(effectiveUserId);
  }
}
