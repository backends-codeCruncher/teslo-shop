import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';

import { JWTPayload } from './interfaces/jwp-payload.interface';

import { bcryptAdapter } from '../config/bcrypt.adapter';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private readonly logger = new Logger('AuthService');

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcryptAdapter.hash(password),
      });

      await this.userRepository.save(user);
      delete user.password;

      const userToken = this.getJWT({ id: user.id });

      return {
        user: user,
        token: userToken,
      };
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        email: true,
        password: true,
        id: true,
        fullName: true,
        isActive: true,
        roles: true,
      },
    });

    if (!user) throw new UnauthorizedException('User not found');
    if (!bcryptAdapter.compare(password, user.password))
      throw new UnauthorizedException('User not valid');

    const userToken = this.getJWT({ id: user.id });

    delete user.password;

    return {
      user: user,
      token: userToken,
    };
  }

  async checkAuthStatus(user: User) {
    const userToken = this.getJWT({ id: user.id });

    return {
      user: user,
      token: userToken,
    };
  }

  private getJWT(payload: JWTPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBException(error: any) {
    this.logger.error(error.detail);
    switch (error.code) {
      case '23505':
        throw new BadRequestException(error.detail);
      default:
        throw new InternalServerErrorException('Error al crear usuario');
    }
  }
}
