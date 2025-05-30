import { plainToClass } from 'class-transformer';
import { PaginationDto } from './pagination.dto';
import { validate } from 'class-validator';

describe('PaginationDto', () => {
  it('should work with default parameters', async () => {
    const dto = plainToClass(PaginationDto, {});

    const errors = await validate(dto);

    expect(dto).toBeDefined();
    expect(errors.length).toBe(0);
  });

  it('should validate limit as a positive number', async () => {
    const dto = plainToClass(PaginationDto, { limit: -1 });

    const errors = await validate(dto);

    const limitError = errors.find((e) => e.property === 'limit');

    expect(limitError).toBeDefined();
  });

  it('should validate offset as a positive number', async () => {
    const dto = plainToClass(PaginationDto, { offset: -1 });

    const errors = await validate(dto);

    const offsetError = errors.find((e) => e.property === 'offset');

    expect(offsetError).toBeDefined();
  });

  it('should allow optional gender field with valid values', () => {
    const validGenders = ['men', 'women', 'unisex', 'kid'];

    validGenders.forEach(async (gender) => {
      const dto = plainToClass(PaginationDto, { gender });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  it('should validate gender with invalid value', async () => {
    const dto = plainToClass(PaginationDto, { gender: 'otro' });

    const errors = await validate(dto);

    const genderError = errors.find((e) => e.property === 'gender');

    expect(genderError).toBeDefined();
  });
});
