import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidRoles } from '../interfaces';
import { Auth } from './auth.decorator';
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';

jest.mock('@nestjs/common', () => ({
  UseGuards: jest.fn(),
  applyDecorators: jest.fn(),
}));

jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn(),
}));

jest.mock('../guards/user-role/user-role.guard', () => ({
  UserRoleGuard: jest.fn(),
}));

jest.mock('./role-protected.decorator', () => ({
  RoleProtected: jest.fn(),
}));

describe('Auth Decorator', () => {
  it('should call applyDecorators with RoleProtected and UseGuards', () => {
    const roles: ValidRoles[] = [ValidRoles.admin, ValidRoles.user];

    Auth(...roles);

    expect(applyDecorators).toHaveBeenCalledWith(
      RoleProtected(...roles),
      UseGuards(AuthGuard(), UserRoleGuard),
    );
  });
});
