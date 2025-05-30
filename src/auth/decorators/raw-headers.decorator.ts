import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const getRawHeaders = (data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.rawHeaders;
};

export const RawHeaders = createParamDecorator(getRawHeaders);
