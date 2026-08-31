import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

const UNAUTHORIZED_ERROR = 'Требуется действительный access token';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = GqlExecutionContext.create(context).getContext<{ req: Request }>().req;
        const token = this.extractToken(request);
        const jwtSecret = process.env.AUTH_JWT_SECRET;

        if (!token || !jwtSecret) {
            throw new UnauthorizedException(UNAUTHORIZED_ERROR);
        }

        try {
            await this.jwtService.verifyAsync(token, { secret: jwtSecret });
        } catch {
            throw new UnauthorizedException(UNAUTHORIZED_ERROR);
        }

        return true;
    }

    private extractToken(request: Request): string | undefined {
        const parts = request.headers.authorization?.split(' ') ?? [];

        return parts.length === 2 && parts[0] === 'Bearer' && parts[1] ? parts[1] : undefined;
    }
}
