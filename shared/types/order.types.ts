export type OrderStatus =
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';

export interface OrderItemDto {
    id: string;
    productVariantId: string;
    productName: string;
    variantLabel: string;
    quantity: number;
    unitPrice: number;
}

export interface OrderDto {
    id: string;
    status: OrderStatus;
    items: OrderItemDto[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    trackingNumber: string | null;
    createdAt: string;
}

export interface CreateOrderDto {
    items: { productVariantId: string; quantity: number }[];
    shippingAddressId: string;
    couponCode?: string;
}

export interface OrderListDto {
    items: OrderDto[];
    total: number;
    page: number;
    limit: number;
}
