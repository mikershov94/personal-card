import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { GraphQLError } from 'graphql';

const UNAUTHORIZED_ERROR = 'Требуется действительный access token';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = GqlExecutionContext.create(context).getContext<{ req: Request }>().req;
        const token = this.extractToken(request);
        const jwtSecret = process.env.AUTH_JWT_SECRET;

        if (!token || !jwtSecret) {
            throw this.createUnauthorizedError();
        }

        try {
            await this.jwtService.verifyAsync(token, { secret: jwtSecret });
        } catch {
            throw this.createUnauthorizedError();
        }

        return true;
    }

    private extractToken(request: Request): string | undefined {
        const parts = request.headers.authorization?.split(' ') ?? [];

        return parts.length === 2 && parts[0] === 'Bearer' && parts[1] ? parts[1] : undefined;
    }

    private createUnauthorizedError(): GraphQLError {
        return new GraphQLError(UNAUTHORIZED_ERROR, {
            extensions: {
                code: 'UNAUTHENTICATED',
                http: { status: 401 },
            },
        });
    }
}
