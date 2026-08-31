import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';

import { AuthPayloadDto } from './dto/auth-payload.output.dto';
import { LoginInput } from './dto/login.input.dto';

interface AuthConfig {
    username: string;
    passwordHash: string;
    jwtSecret: string;
    jwtExpiresInSeconds: number;
}

const AUTH_CONFIGURATION_ERROR = 'Конфигурация аутентификации недоступна';
const INVALID_CREDENTIALS_ERROR = 'Неверные учётные данные';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) {}

    public async login(input: LoginInput): Promise<AuthPayloadDto> {
        const config = this.getConfig();
        const passwordMatches = await this.verifyPassword(config.passwordHash, input.password);

        if (input.username !== config.username || !passwordMatches) {
            throw new UnauthorizedException(INVALID_CREDENTIALS_ERROR);
        }

        const accessToken = await this.jwtService.signAsync(
            { sub: config.username },
            {
                secret: config.jwtSecret,
                expiresIn: config.jwtExpiresInSeconds,
            },
        );

        return { accessToken };
    }

    private getConfig(): AuthConfig {
        const username = process.env.AUTH_ADMIN_USERNAME;
        const passwordHash = process.env.AUTH_ADMIN_PASSWORD_HASH;
        const jwtSecret = process.env.AUTH_JWT_SECRET;
        const jwtExpiresIn = process.env.AUTH_JWT_EXPIRES_IN;

        if (!username || !passwordHash || !jwtSecret || !jwtExpiresIn) {
            throw new InternalServerErrorException(AUTH_CONFIGURATION_ERROR);
        }

        return {
            username,
            passwordHash,
            jwtSecret,
            jwtExpiresInSeconds: this.parseDuration(jwtExpiresIn),
        };
    }

    private parseDuration(duration: string): number {
        const match = /^(\d+)(s|m|h|d)$/.exec(duration);

        if (!match) {
            throw new InternalServerErrorException(AUTH_CONFIGURATION_ERROR);
        }

        const value = Number(match[1]);
        const unit = match[2];
        const secondsByUnit: Record<string, number> = {
            s: 1,
            m: 60,
            h: 60 * 60,
            d: 24 * 60 * 60,
        };

        if (!Number.isSafeInteger(value) || value < 1) {
            throw new InternalServerErrorException(AUTH_CONFIGURATION_ERROR);
        }

        return value * secondsByUnit[unit];
    }

    private async verifyPassword(passwordHash: string, password: string): Promise<boolean> {
        try {
            return await verify(passwordHash, password);
        } catch {
            throw new InternalServerErrorException(AUTH_CONFIGURATION_ERROR);
        }
    }
}
