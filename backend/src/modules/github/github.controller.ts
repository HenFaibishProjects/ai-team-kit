import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Post('verify-token')
  async verifyToken(@Body('token') token: string) {
    if (!token) {
      throw new HttpException('Token is required', HttpStatus.BAD_REQUEST);
    }
    return this.githubService.verifyToken(token);
  }

  @Get('repositories')
  async getRepositories(@Query('token') token: string) {
    if (!token) {
      throw new HttpException('Token is required', HttpStatus.BAD_REQUEST);
    }
    return this.githubService.getUserRepositories(token);
  }

  @Get('repository-details')
  async getRepositoryDetails(
    @Query('token') token: string,
    @Query('owner') owner: string,
    @Query('repo') repo: string,
  ) {
    if (!token || !owner || !repo) {
      throw new HttpException(
        'Token, owner, and repo are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.githubService.getRepositoryDetails(token, owner, repo);
  }

  @Get('directory-structure')
  async getDirectoryStructure(
    @Query('token') token: string,
    @Query('owner') owner: string,
    @Query('repo') repo: string,
    @Query('path') path?: string,
  ) {
    if (!token || !owner || !repo) {
      throw new HttpException(
        'Token, owner, and repo are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.githubService.getDirectoryStructure(
      token,
      owner,
      repo,
      path || '',
    );
  }

  @Post('parse-url')
  async parseUrl(@Body('url') url: string) {
    if (!url) {
      throw new HttpException('URL is required', HttpStatus.BAD_REQUEST);
    }
    const parsed = this.githubService.parseGithubUrl(url);
    if (!parsed) {
      throw new HttpException('Invalid GitHub URL', HttpStatus.BAD_REQUEST);
    }
    return parsed;
  }
}
