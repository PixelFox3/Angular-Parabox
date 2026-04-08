import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';
import { MergeCartDto, UpsertCartItemDto } from './dto/cart.dto';

interface AuthenticatedUser {
    id: string;
    email: string;
    role: string;
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    getCart(@CurrentUser() user: AuthenticatedUser) {
        return this.cartService.getCart(user.id);
    }

    @Put('items')
    upsertItem(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpsertCartItemDto,
    ) {
        return this.cartService.upsertItem(user.id, dto);
    }

    @Delete('items/:productId')
    @HttpCode(HttpStatus.OK)
    removeItem(
        @CurrentUser() user: AuthenticatedUser,
        @Param('productId') productId: string,
    ) {
        return this.cartService.removeItem(user.id, productId);
    }

    @Delete()
    @HttpCode(HttpStatus.OK)
    clearCart(@CurrentUser() user: AuthenticatedUser) {
        return this.cartService.clearCart(user.id);
    }

    @Post('merge')
    mergeGuestCart(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: MergeCartDto,
    ) {
        return this.cartService.mergeGuestCart(user.id, dto);
    }
}
