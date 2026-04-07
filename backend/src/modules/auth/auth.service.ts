import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_COOKIE = 'refresh_token';

export interface SafeUser {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    role: string;
    emailVerified: boolean;
    createdAt: Date;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) { }

    async register(dto: RegisterDto, res: Response): Promise<{ user: SafeUser; accessToken: string }> {
        const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (exists) {
            throw new ConflictException('Email already in use');
        }

        const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                name: dto.name ?? null,
            },
        });

        const tokens = await this.generateTokens({ sub: user.id, email: user.email, role: user.role });
        await this.storeRefreshToken(user.id, tokens.refreshToken);
        this.setRefreshTokenCookie(res, tokens.refreshToken);

        return { user: this.toSafeUser(user), accessToken: tokens.accessToken };
    }

    async login(dto: LoginDto, res: Response): Promise<{ user: SafeUser; accessToken: string }> {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email, deletedAt: null } });
        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = await this.generateTokens({ sub: user.id, email: user.email, role: user.role });
        await this.storeRefreshToken(user.id, tokens.refreshToken);
        this.setRefreshTokenCookie(res, tokens.refreshToken);

        return { user: this.toSafeUser(user), accessToken: tokens.accessToken };
    }

    async logout(userId: string, res: Response): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash: null },
        });
        res.clearCookie(REFRESH_TOKEN_COOKIE, { httpOnly: true, sameSite: 'strict', secure: true });
    }

    async refresh(
        userId: string,
        refreshToken: string,
        res: Response,
    ): Promise<{ accessToken: string }> {
        const user = await this.prisma.user.findUnique({ where: { id: userId, deletedAt: null } });
        if (!user || !user.refreshTokenHash) {
            throw new UnauthorizedException();
        }

        const tokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!tokenMatches) {
            throw new UnauthorizedException();
        }

        const tokens = await this.generateTokens({ sub: user.id, email: user.email, role: user.role });
        await this.storeRefreshToken(user.id, tokens.refreshToken);
        this.setRefreshTokenCookie(res, tokens.refreshToken);

        return { accessToken: tokens.accessToken };
    }

    private async generateTokens(payload: JwtPayload): Promise<{ accessToken: string; refreshToken: string }> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.getOrThrow<string>('JWT_SECRET'),
                expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '15m'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
            }),
        ]);
        return { accessToken, refreshToken };
    }

    private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
        const hash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
        await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: hash } });
    }

    private setRefreshTokenCookie(res: Response, token: string): void {
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        res.cookie(REFRESH_TOKEN_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: sevenDays,
            path: '/',
        });
    }

    private toSafeUser(user: { id: string; email: string; name: string | null; avatarUrl: string | null; role: string; emailVerified: boolean; createdAt: Date }): SafeUser {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            role: user.role,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
        };
    }
}
