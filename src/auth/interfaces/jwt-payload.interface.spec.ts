import { JWTPayload } from './jwp-payload.interface';

describe('JwtPayload interface', () => {
  it('should return true for a valid payload', () => {
    const payload: JWTPayload = { id: 'Abc123' };

    expect(payload.id).toBe('Abc123');
  });
});
