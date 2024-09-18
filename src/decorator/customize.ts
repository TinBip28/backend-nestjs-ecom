import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

export const RESPONSE_MESSAGE = 'response_message';

export const UserReq = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message);
