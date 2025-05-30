import { Reflector } from '@nestjs/core';
import { UserRoleGuard } from './user-role.guard';
import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

describe('UserRole Guard', () => {
  let guard: UserRoleGuard;
  let reflector: Reflector;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new UserRoleGuard(reflector);
    mockContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    } as unknown as ExecutionContext;
  });

  it('should return true if not roles present', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should return true if not roles are required', () => {
    jest.spyOn(reflector, 'get').mockReturnValue([]);

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw BadRequestException if user is not found', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    jest.spyOn(mockContext.switchToHttp(), 'getRequest').mockReturnValue({});

    expect(() => guard.canActivate(mockContext)).toThrow(BadRequestException);
    expect(() => guard.canActivate(mockContext)).toThrow('User not found');
  });

  it('should return true if user has a valid role', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

    jest.spyOn(mockContext.switchToHttp(), 'getRequest').mockReturnValue({
      user: {
        roles: ['admin'],
      },
    });

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw forbidden user lacks a required role', () => {
    const user = {
      roles: ['user'],
      fullName: 'Sergio Barreras',
    };

    const validRoles = ['admin'];

    jest.spyOn(reflector, 'get').mockReturnValue(validRoles);

    jest.spyOn(mockContext.switchToHttp(), 'getRequest').mockReturnValue({
      user,
    });

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(mockContext)).toThrow(
      `User ${user.fullName} need a valid role: [${validRoles}]`,
    );
  });
});
