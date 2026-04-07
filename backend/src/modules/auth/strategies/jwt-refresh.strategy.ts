import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtRefreshPayload {
    sub: string;
    email: string;
    role: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.['refresh_token'] as string | null ?? null,
            ]),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
    }

    validate(req: Request, payload: JwtRefreshPayload) {
        const refreshToken = req.cookies?.['refresh_token'] as string | undefined;
        if (!refreshToken) {
            throw new UnauthorizedException();
        }
        return { id: payload.sub, email: payload.email, role: payload.role, refreshToken };
    }
}
