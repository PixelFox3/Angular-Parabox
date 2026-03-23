import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from '../../products/services/product.service';
import { StoreConfigService } from '../../../shared/services/store-config.service';

export interface CartItem {
    product: Product;
    quantity: number;
}

@Injectable({
    providedIn: 'root',
})
export class CartService {
    private cartItems = signal<CartItem[]>([]);
    private drawerOpen = signal(false);

    // Expose cart items as computed signal (read-only)
    items = computed(() => this.cartItems());

    // Compute cart total
    total = computed(() => {
        return this.cartItems().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    });

    // Compute item count
    itemCount = computed(() => {
        return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
    });

    isDrawerOpen = computed(() => this.drawerOpen());

    addToCart(product: Product, quantity: number = 1): void {
        const cartState = this.cartItems();
        const existingItem = cartState.find(item => item.product.id === product.id);

        if (existingItem) {
            // Update quantity if product already in cart
            this.cartItems.update(items =>
                items.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            );
        } else {
            // Add new product to cart
            this.cartItems.update(items => [...items, { product, quantity }]);
        }

        this.drawerOpen.set(true);
    }

    removeFromCart(productId: number): void {
        this.cartItems.update(items => items.filter(item => item.product.id !== productId));
    }

    updateQuantity(productId: number, quantity: number): void {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        this.cartItems.update(items =>
            items.map(item =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        );
    }

    incrementQuantity(productId: number): void {
        const item = this.cartItems().find(item => item.product.id === productId);
        if (item) {
            this.updateQuantity(productId, item.quantity + 1);
        }
    }

    decrementQuantity(productId: number): void {
        const item = this.cartItems().find(item => item.product.id === productId);
        if (item) {
            this.updateQuantity(productId, item.quantity - 1);
        }
    }

    clearCart(): void {
        this.cartItems.set([]);
    }

    openDrawer(): void {
        this.drawerOpen.set(true);
    }

    closeDrawer(): void {
        this.drawerOpen.set(false);
    }

    toggleDrawer(): void {
        this.drawerOpen.update(value => !value);
    }
}
