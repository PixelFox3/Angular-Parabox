import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, firstValueFrom, debounceTime, switchMap } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { environment } from '../../../../environments/environment';

const GUEST_CART_KEY = 'parabox_cart';
const DEBOUNCE_MS = 400;

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

    // Per-product debounce subjects keyed by productId
    private readonly pendingUpdates = new Map<string, Subject<number>>();

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
            this.scheduleSync(product.id, newQty);
        } else {
            this.persistGuestCart();
        }
    }

    removeFromCart(productId: string): void {
        this.cancelPendingSync(productId);
        this.cartItems.update(items => items.filter(i => i.product.id !== productId));

        if (this.authService.isAuthenticated()) {
            this.http
                .delete<ApiCart>(`${this.apiUrl}/items/${productId}`)
                .subscribe({ next: cart => this.syncServerCart(cart) });
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
            this.scheduleSync(productId, quantity);
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
        this.pendingUpdates.forEach((_, id) => this.cancelPendingSync(id));
        this.cartItems.set([]);

        if (this.authService.isAuthenticated()) {
            this.http
                .delete<ApiCart>(this.apiUrl)
                .subscribe({ next: cart => this.syncServerCart(cart) });
        } else {
            this.clearGuestCart();
        }
    }

    // ── Drawer ────────────────────────────────────────────────────────────────

    openDrawer(): void { this.drawerOpen.set(true); }
    closeDrawer(): void { this.drawerOpen.set(false); }
    toggleDrawer(): void { this.drawerOpen.update(v => !v); }

    // ── Private helpers ───────────────────────────────────────────────────────

    // Debounced per-product write: many quick clicks → single HTTP request
    private scheduleSync(productId: string, quantity: number): void {
        if (!this.pendingUpdates.has(productId)) {
            const subject = new Subject<number>();
            this.pendingUpdates.set(productId, subject);

            subject.pipe(
                debounceTime(DEBOUNCE_MS),
                switchMap(qty =>
                    this.http.put<ApiCart>(`${this.apiUrl}/items`, { productId, quantity: qty }),
                ),
            ).subscribe({
                next: cart => this.syncServerItem(productId, cart),
                error: () => { void this.loadServerCart(); },
            });
        }
        this.pendingUpdates.get(productId)!.next(quantity);
    }

    private cancelPendingSync(productId: string): void {
        const subject = this.pendingUpdates.get(productId);
        if (subject) {
            subject.complete();
            this.pendingUpdates.delete(productId);
        }
    }

    // Only update the single changed item — avoids overwriting concurrent edits on other items
    private syncServerItem(productId: string, cart: ApiCart): void {
        const serverItem = cart.items.find(i => i.productId === productId);
        if (!serverItem) {
            // Item was removed on the server (e.g. product deleted)
            this.cartItems.update(items => items.filter(i => i.product.id !== productId));
            return;
        }
        const confirmed = toCartItem(serverItem);
        this.cartItems.update(items =>
            items.map(i => i.product.id === productId ? confirmed : i),
        );
    }

    // Full cart overwrite — used only for merge/load/clear operations
    private syncServerCart(cart: ApiCart): void {
        this.cartItems.set(cart.items.map(toCartItem));
    }

    private async loadServerCart(): Promise<void> {
        try {
            const cart = await firstValueFrom(this.http.get<ApiCart>(this.apiUrl));
            this.syncServerCart(cart);
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
                this.syncServerCart(cart);
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

