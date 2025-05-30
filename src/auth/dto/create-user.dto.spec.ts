import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('should have the correct properties', async () => {
    const dto = new CreateUserDto();

    dto.email = 'sergiobg.isc@gmail.com';
    dto.fullName = 'Sergio Barreras';
    dto.password = 'Ax1Bz2';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should throws errors if password is not valid', async () => {
    const dto = new CreateUserDto();

    dto.email = 'sergiobg.isc@gmail.com';
    dto.fullName = 'Sergio Barreras';
    dto.password = 'Ax1Bz';

    const errors = await validate(dto);

    const passwordError = errors.find((e) => e.property === 'password');

    expect(passwordError).toBeDefined();
  });
});
