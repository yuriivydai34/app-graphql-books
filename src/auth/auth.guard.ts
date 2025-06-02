import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './decorator';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    let token: string | undefined;

    if (context.getType() === 'http') {
      // Handle REST requests
      const request = context.switchToHttp().getRequest();
      token = this.extractTokenFromHeader(request);
    } else {
      // Handle GraphQL requests
      const gqlContext = GqlExecutionContext.create(context);
      const request = gqlContext.getContext().req;
      token = this.extractTokenFromHeader(request);
    }

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      
      // For REST requests
      if (context.getType() === 'http') {
        const request = context.switchToHttp().getRequest();
        request['user'] = payload;
      } else {
        // For GraphQL requests
        const gqlContext = GqlExecutionContext.create(context);
        const request = gqlContext.getContext().req;
        request['user'] = payload;
      }
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
