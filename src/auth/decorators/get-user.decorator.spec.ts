import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { getUser } from './get-user.decorator';

jest.mock('@nestjs/common', () => ({
  createParamDecorator: jest.fn(),
  InternalServerErrorException:
    jest.requireActual('@nestjs/common').InternalServerErrorException,
}));

describe('GetUser Decorator', () => {
  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        user: { id: '1', name: 'John Doe' },
      }),
    }),
  } as unknown as ExecutionContext;

  it('should return the raw user from the request', () => {
    const result = getUser(null, mockExecutionContext);

    expect(result).toEqual({ id: '1', name: 'John Doe' });
  });

  it('should return the username from the request', () => {
    const result = getUser('name', mockExecutionContext);

    expect(result).toBe('John Doe');
  });

  it('should throw an internal server error if user is not present', () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: null,
        }),
      }),
    } as unknown as ExecutionContext;

    try {
      getUser(null, mockExecutionContext);
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(InternalServerErrorException);
    }
  });
});
