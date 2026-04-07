import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id, deletedAt: null },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                role: true,
                emailVerified: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updateProfile(id: string, dto: UpdateProfileDto) {
        const user = await this.prisma.user.findUnique({ where: { id, deletedAt: null } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prisma.user.update({
            where: { id },
            data: { name: dto.name, avatarUrl: dto.avatarUrl },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                role: true,
                emailVerified: true,
                createdAt: true,
            },
        });
    }

    async softDelete(id: string): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { id, deletedAt: null } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.prisma.user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                pendingDeletion: true,
                refreshTokenHash: null,
            },
        });
    }
}
