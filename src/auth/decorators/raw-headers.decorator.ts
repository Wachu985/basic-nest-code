import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

export const RawHeaders = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const rawHeader = req.rawHeaders;

    if (!rawHeader)
      throw new InternalServerErrorException(`Fail to found (rawHeaders)`);

    return rawHeader;
  },
);
