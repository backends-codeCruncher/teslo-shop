import { ValidRoles } from '../interfaces';
import { META_ROLES, RoleProtected } from './role-protected.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn().mockImplementation((key, value) => ({
    key,
    value,
  })),
}));

describe('RoleProtected Decorator', () => {
  it('should set metada with the correct roles', () => {
    const roles = [ValidRoles.admin, ValidRoles.user];

    const result = RoleProtected(...roles);

    expect(result).toEqual({
      key: META_ROLES,
      value: roles,
    });
  });
});
