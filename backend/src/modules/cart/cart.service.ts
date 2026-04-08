import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { MergeCartDto, UpsertCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
    constructor(private readonly prisma: PrismaService) { }

    async getCart(userId: string) {
        await this.getOrCreate(userId);
        return this.fetchItems(userId);
    }

    async upsertItem(userId: string, dto: UpsertCartItemDto) {
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId, deletedAt: null },
        });
        if (!product) throw new NotFoundException('Product not found');

        const cart = await this.getOrCreate(userId);
        await this.prisma.cartItem.upsert({
            where: { cartId_productId: { cartId: cart.id, productId: dto.productId } },
            create: { cartId: cart.id, productId: dto.productId, quantity: dto.quantity },
            update: { quantity: dto.quantity },
        });

        return this.fetchItems(userId);
    }

    async removeItem(userId: string, productId: string) {
        const cart = await this.getOrCreate(userId);
        await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
        return this.fetchItems(userId);
    }

    async clearCart(userId: string) {
        const cart = await this.getOrCreate(userId);
        await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        return this.fetchItems(userId);
    }

    async mergeGuestCart(userId: string, dto: MergeCartDto) {
        if (dto.items.length === 0) return this.getCart(userId);

        const cart = await this.getOrCreate(userId);
        const existing = await this.prisma.cartItem.findMany({ where: { cartId: cart.id } });
        const existingQtyMap = new Map(existing.map(i => [i.productId, i.quantity]));

        const validProducts = await this.prisma.product.findMany({
            where: { id: { in: dto.items.map(i => i.productId) }, deletedAt: null },
            select: { id: true },
        });
        const validIds = new Set(validProducts.map(p => p.id));

        for (const item of dto.items) {
            if (!validIds.has(item.productId)) continue;
            const newQty = Math.min((existingQtyMap.get(item.productId) ?? 0) + item.quantity, 999);
            await this.prisma.cartItem.upsert({
                where: { cartId_productId: { cartId: cart.id, productId: item.productId } },
                create: { cartId: cart.id, productId: item.productId, quantity: newQty },
                update: { quantity: newQty },
            });
        }

        return this.fetchItems(userId);
    }

    private getOrCreate(userId: string) {
        return this.prisma.cart.upsert({
            where: { userId },
            create: { userId },
            update: {},
        });
    }

    private fetchItems(userId: string) {
        return this.prisma.cart.findFirstOrThrow({
            where: { userId },
            select: {
                id: true,
                items: {
                    select: {
                        productId: true,
                        quantity: true,
                        product: {
                            select: { id: true, name: true, price: true, images: true },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }
}
