import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout() {
    // With JWT, logout is handled client-side by removing the token
    return { message: 'Logged out successfully' };
  }

  @Get('projects')
  @UseGuards(JwtAuthGuard)
  async getUserProjects(@Request() req: any) {
    return this.authService.getUserProjects(req.user.userId);
  }

  @Get('organization/users')
  @UseGuards(JwtAuthGuard)
  async getOrganizationUsers(@Request() req: any) {
    return this.authService.getOrganizationUsers(req.user.userId);
  }

  @Get('users/:userId/projects')
  @UseGuards(JwtAuthGuard)
  async getUserProjectsById(@Request() req: any, @Query('userId') userId: string) {
    // Verify the requesting user is from the same organization
    return this.authService.getUserProjectsById(req.user.userId, userId);
  }
}
