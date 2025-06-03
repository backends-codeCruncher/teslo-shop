import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      create: jest.fn(),
      login: jest.fn(),
      checkAuthStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
      imports: [
        PassportModule.register({
          defaultStrategy: 'jwt',
        }),
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should create user with the proper DTO', async () => {
    const dto: CreateUserDto = {
      email: 'test@google.com',
      password: 'ABbc123',
      fullName: 'Test User',
    };

    await authController.create(dto);

    expect(authService.create).toHaveBeenCalledWith(dto);
  });

  it('should login user with the proper DTO', async () => {
    const dto: LoginUserDto = {
      email: 'test@google.com',
      password: 'ABbc123',
    };

    await authController.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('should check user auth status', async () => {
    const user = {
      email: 'test@google.com',
      password: 'Abc123',
      fullName: 'Test User',
    } as User;

    await authController.checkAuthStatus(user);

    expect(authService.checkAuthStatus).toHaveBeenCalledWith(user);
  });

  it('should return private route data', async () => {
    const user = {
      id: '1',
      email: 'test@google.com',
      fullName: 'Test User',
    } as User;

    const request = {} as Express.Request;
    const rawHeaders = ['header1: value1', 'header2: value2'];

    const result = await authController.privateRoute1(
      user,
      user.email,
      rawHeaders,
      request,
    );

    expect(result).toEqual({
      user: { id: '1', email: 'test@google.com', fullName: 'Test User' },
      userEmail: 'test@google.com',
      rawHeaders: ['header1: value1', 'header2: value2'],
    });
  });
});
