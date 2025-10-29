import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, username, password, organizationName, intendedUse } =
      registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24 hours expiry

    // Create user
    const user = this.userRepository.create({
      email,
      username,
      passwordHash,
      organizationName,
      intendedUse,
      isActive: false,
      verificationToken,
      verificationTokenExpiry,
    });

    await this.userRepository.save(user);

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(email, verificationToken);
    } catch (error) {
      this.logger.error('Failed to send verification email', error);
      // Don't fail registration if email fails
    }

    this.logger.log(`User registered: ${email}`);

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (
      !user.verificationTokenExpiry ||
      user.verificationTokenExpiry < new Date()
    ) {
      throw new BadRequestException('Verification token has expired');
    }

    if (user.isActive) {
      throw new BadRequestException('Account is already verified');
    }

    // Activate user
    user.isActive = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;

    await this.userRepository.save(user);

    this.logger.log(`User verified: ${user.email}`);

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: any }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User logged in: ${email}`);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        organizationName: user.organizationName,
      },
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      organizationName: user.organizationName,
      intendedUse: user.intendedUse,
      createdAt: user.createdAt,
    };
  }
}
