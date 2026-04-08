import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { environment } from '../../../../environments/environment';

const GUEST_CART_KEY = 'parabox_cart';

// Minimal product shape stored in the cart (no description needed for display)
export interface CartProduct {
    id: string;
    name: string;
    price: number;
    image: string;
}

export interface CartItem {
    product: CartProduct;
    quantity: number;
}

// Shape of the backend cart API response
interface ApiCartProduct {
    id: string;
    name: string;
    price: string; // Prisma Decimal serialises as string
    images: string[];
}

interface ApiCartItem {
    productId: string;
    quantity: number;
    product: ApiCartProduct;
}

interface ApiCart {
    id: string;
    items: ApiCartItem[];
}

function toCartItem(api: ApiCartItem): CartItem {
    return {
        product: {
            id: api.product.id,
            name: api.product.name,
            price: Number(api.product.price),
            image: api.product.images[0] ?? '',
        },
        quantity: api.quantity,
    };
}

@Injectable({ providedIn: 'root' })
export class CartService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly toast = inject(ToastService);
    private readonly apiUrl = `${environment.apiUrl}/cart`;

    private readonly cartItems = signal<CartItem[]>([]);
    private readonly drawerOpen = signal(false);

    readonly items = this.cartItems.asReadonly();
    readonly isDrawerOpen = computed(() => this.drawerOpen());
    readonly total = computed(() =>
        this.cartItems().reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    );
    readonly itemCount = computed(() =>
        this.cartItems().reduce((sum, item) => sum + item.quantity, 0),
    );

    // Track whether the initial cart load has already happened
    private cartInitialized = false;

    constructor() {
        // React to auth state: initialise on first run, handle login/logout transitions after.
        effect(() => {
            const isAuth = this.authService.isAuthenticated();
            const initialized = this.authService.isInitialized();

            if (!initialized) return;

            if (!this.cartInitialized) {
                this.cartInitialized = true;
                if (isAuth) {
                    void this.loadServerCart();
                } else {
                    this.cartItems.set(this.readGuestCart());
                }
                return;
            }

            // Subsequent changes: login → merge guest cart; logout → clear
            if (isAuth) {
                void this.onLoginMerge();
            } else {
                this.onLogout();
            }
        });
    }

    // ── Mutations ─────────────────────────────────────────────────────────────

    addToCart(product: CartProduct, quantity = 1): void {
        const existing = this.cartItems().find(i => i.product.id === product.id);
        const newQty = (existing?.quantity ?? 0) + quantity;

        this.cartItems.update(items =>
            existing
                ? items.map(i =>
                    i.product.id === product.id ? { ...i, quantity: newQty } : i,
                )
                : [
                    ...items,
                    {
                        product: {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                        },
                        quantity,
                    },
                ],
        );

        this.drawerOpen.set(true);

        if (this.authService.isAuthenticated()) {
            this.http
                .put<ApiCart>(`${this.apiUrl}/items`, { productId: product.id, quantity: newQty })
                .subscribe({
                    next: cart => this.cartItems.set(cart.items.map(toCartItem)),
                    error: () => { void this.loadServerCart(); },
                });
        } else {
            this.persistGuestCart();
        }
    }

    removeFromCart(productId: string): void {
        this.cartItems.update(items => items.filter(i => i.product.id !== productId));

        if (this.authService.isAuthenticated()) {
            this.http
                .delete<ApiCart>(`${this.apiUrl}/items/${productId}`)
                .subscribe({ next: cart => this.cartItems.set(cart.items.map(toCartItem)) });
        } else {
            this.persistGuestCart();
        }
    }

    updateQuantity(productId: string, quantity: number): void {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        this.cartItems.update(items =>
            items.map(i => (i.product.id === productId ? { ...i, quantity } : i)),
        );

        if (this.authService.isAuthenticated()) {
            this.http
                .put<ApiCart>(`${this.apiUrl}/items`, { productId, quantity })
                .subscribe({ next: cart => this.cartItems.set(cart.items.map(toCartItem)) });
        } else {
            this.persistGuestCart();
        }
    }

    incrementQuantity(productId: string): void {
        const item = this.cartItems().find(i => i.product.id === productId);
        if (item) this.updateQuantity(productId, item.quantity + 1);
    }

    decrementQuantity(productId: string): void {
        const item = this.cartItems().find(i => i.product.id === productId);
        if (item) this.updateQuantity(productId, item.quantity - 1);
    }

    clearCart(): void {
        this.cartItems.set([]);

        if (this.authService.isAuthenticated()) {
            this.http
                .delete<ApiCart>(this.apiUrl)
                .subscribe({ next: cart => this.cartItems.set(cart.items.map(toCartItem)) });
        } else {
            this.clearGuestCart();
        }
    }

    // ── Drawer ────────────────────────────────────────────────────────────────

    openDrawer(): void { this.drawerOpen.set(true); }
    closeDrawer(): void { this.drawerOpen.set(false); }
    toggleDrawer(): void { this.drawerOpen.update(v => !v); }

    // ── Private helpers ───────────────────────────────────────────────────────

    private async loadServerCart(): Promise<void> {
        try {
            const cart = await firstValueFrom(this.http.get<ApiCart>(this.apiUrl));
            this.cartItems.set(cart.items.map(toCartItem));
        } catch {
            this.cartItems.set([]);
        }
    }

    private async onLoginMerge(): Promise<void> {
        const guestItems = this.readGuestCart();

        if (guestItems.length > 0) {
            try {
                const cart = await firstValueFrom(
                    this.http.post<ApiCart>(`${this.apiUrl}/merge`, {
                        items: guestItems.map(i => ({
                            productId: i.product.id,
                            quantity: i.quantity,
                        })),
                    }),
                );
                this.cartItems.set(cart.items.map(toCartItem));
                this.clearGuestCart();
                this.toast.show('Tu carrito ha sido guardado en tu cuenta', 'success');
            } catch {
                await this.loadServerCart();
            }
        } else {
            await this.loadServerCart();
        }
    }

    private onLogout(): void {
        this.cartItems.set([]);
        this.clearGuestCart();
        this.drawerOpen.set(false);
    }

    private persistGuestCart(): void {
        try {
            localStorage.setItem(GUEST_CART_KEY, JSON.stringify(this.cartItems()));
        } catch { /* ignore storage quota errors */ }
    }

    private readGuestCart(): CartItem[] {
        try {
            const raw = localStorage.getItem(GUEST_CART_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw) as unknown;
            if (!Array.isArray(parsed)) return [];
            return (parsed as CartItem[]).filter(
                item =>
                    typeof item?.product?.id === 'string' &&
                    typeof item.product.name === 'string' &&
                    typeof item.product.price === 'number' &&
                    typeof item.quantity === 'number' &&
                    item.quantity > 0,
            );
        } catch {
            return [];
        }
    }

    private clearGuestCart(): void {
        try { localStorage.removeItem(GUEST_CART_KEY); } catch { /* ignore */ }
    }
}

