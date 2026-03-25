export interface ProductVariantDto {
    id: string;
    size?: string;
    color?: string;
    stock: number;
}

export interface ProductDto {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    variants: ProductVariantDto[];
    createdAt: string;
}

export interface ProductListDto {
    items: ProductDto[];
    total: number;
    page: number;
    limit: number;
}

export interface ProductFilterDto {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
    page?: number;
    limit?: number;
}
