import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto';

import { bcryptAdapter } from '../config/bcrypt.adapter';
import { BadRequestException } from '@nestjs/common';

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
});
