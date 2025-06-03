import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto';

import { bcryptAdapter } from '../config/bcrypt.adapter';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;

  const mockTokenValue = 'mock-jwt-token';

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue(mockTokenValue),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should create a user and return it with token', async () => {
    const dto: CreateUserDto = {
      email: 'test@google.com',
      fullName: 'Test User',
      password: 'Ax1Bz2',
    };

    const user = {
      email: dto.email,
      fullName: dto.fullName,
      id: '1',
      isActive: true,
      roles: ['user'],
    } as User;

    jest.spyOn(userRepository, 'create').mockReturnValue(user);
    jest.spyOn(bcryptAdapter, 'hash').mockReturnValue('AeomvpASDAefjAdfsn');

    const response = await authService.create(dto);

    expect(bcryptAdapter.hash).toHaveBeenCalledWith(dto.password);
    expect(response).toEqual({
      user: {
        email: user.email,
        fullName: user.fullName,
        id: user.id,
        isActive: user.isActive,
        roles: user.roles,
      },
      token: mockTokenValue,
    });
  });

  it('should throw an error if email already exists', async () => {
    const dto: CreateUserDto = {
      email: 'test@google.com',
      fullName: 'Test User',
      password: 'Ax1Bz2',
    };

    jest
      .spyOn(userRepository, 'save')
      .mockRejectedValue({ code: '23505', detail: 'Email already exist' });

    await expect(authService.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw an internal server error', async () => {
    const dto: CreateUserDto = {
      email: 'test@google.com',
      fullName: 'Test User',
      password: 'Abc123',
    };

    jest.spyOn(userRepository, 'save').mockRejectedValue({ code: '5' });

    await expect(authService.create(dto)).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should login user and return token', async () => {
    const dto: LoginUserDto = {
      email: 'test3@google.com',
      password: 'Ax1Bz2',
    };

    const user = {
      ...dto,
      isActive: true,
      fullName: 'Test User',
      roles: ['user'],
    } as User;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest.spyOn(bcryptAdapter, 'compare').mockReturnValue(true);

    const result = await authService.login(dto);

    expect(result).toEqual({
      user: {
        email: user.email,
        isActive: user.isActive,
        fullName: user.fullName,
        roles: user.roles,
      },
      token: mockTokenValue,
    });
  });

  it('should throw Unauthorized exception if user not found', async () => {
    const dto: LoginUserDto = {
      email: 'test3@google.com',
      password: 'Ax1Bz2',
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    await expect(authService.login(dto)).rejects.toThrow('User not found');
  });

  it('should throw Unauthorized exception if user password not valid', async () => {
    const dto: LoginUserDto = {
      email: 'test3@google.com',
      password: 'Ax1Bz2',
    };

    const user = {
      ...dto,
      isActive: true,
      fullName: 'Test User',
      roles: ['user'],
    } as User;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest.spyOn(bcryptAdapter, 'compare').mockReturnValue(false);

    await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    await expect(authService.login(dto)).rejects.toThrow('User not valid');
  });

  it('should check auth status and return user with new token', async () => {
    const user = {
      id: '1',
      email: 'test3@google.com',
    } as User;

    const result = await authService.checkAuthStatus(user);

    expect(result).toEqual({
      user: { id: user.id, email: user.email },
      token: mockTokenValue,
    });
  });
});
