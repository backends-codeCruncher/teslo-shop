import { User } from './user.entity';

describe('User Entity', () => {
  it('should create an User Instance', () => {
    const user = new User();

    expect(user).toBeInstanceOf(User);
  });

  it('should clear email before save', () => {
    const user = new User();
    user.email = 'Test@gmail.com    ';
    user.checkFieldBeforeInsert();

    expect(user.email).toBe('test@gmail.com')
  });
  
  it('should clear email before update', () => {
    const user = new User();
    user.email = 'Test@gmail.com    ';
    user.checkFieldBeforeUpdate();

    expect(user.email).toBe('test@gmail.com')
  });
});
