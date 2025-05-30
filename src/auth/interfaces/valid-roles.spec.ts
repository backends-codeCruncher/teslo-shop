import { ValidRoles } from './valid-roles';

describe('Valid roles enum', () => {
  it('should have correct values', () => {
    expect(ValidRoles.admin).toBe('admin');
    expect(ValidRoles.superUser).toBe('super-user');
    expect(ValidRoles.user).toBe('user');
  });

  it('should contain all expect values', () => {
    const keysToHave = ['admin', 'super-user', 'user'];

    expect(Object.values(ValidRoles)).toEqual(
      expect.arrayContaining(keysToHave),
    );
  });
});
