import { validate } from 'class-validator';
import { LoginUserDto } from './login-user.dto';
import { plainToClass } from 'class-transformer';

describe('LoginUserDto', () => {
  it('should have the correct properties', async () => {
    const dto = plainToClass(LoginUserDto, {
      email: 'sergiobg.isc@gmail.com',
      password: 'Ax1Bz2',
    });

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should throws errors if password is not valid', async () => {
    const dto = plainToClass(LoginUserDto, {
      email: 'sergiobg.isc@gmail.com',
      password: 'Ax1Bz',
    });

    const errors = await validate(dto);

    const passwordError = errors.find((e) => e.property === 'password');

    expect(passwordError).toBeDefined();
  });
});
