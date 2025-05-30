import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getRawHeaders } from './raw-headers.decorator';

jest.mock('@nestjs/common', () => ({
  createParamDecorator: jest.fn().mockImplementation(() => jest.fn()),
}));

describe('RawHeaders Decorator', () => {
  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        rawHeaders: ['Authorization', 'Bearer Token', 'User-Agent'],
      }),
    }),
  } as unknown as ExecutionContext;

  it('should return the raw headers from the request', () => {
    const result = getRawHeaders(null, mockExecutionContext);

    expect(result).toEqual(['Authorization', 'Bearer Token', 'User-Agent']);
  });

  it('should call createParamDecorator with getRawHeaders', () => {
    expect(createParamDecorator).toHaveBeenCalledWith(getRawHeaders);
  });
});
