import { Injectable } from '@angular/core';

import itemsData from '../../../Items.json';

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    image: string;
}

interface CatalogItem {
    id: number;
    nombre: string;
    precio: number;
    imagen: string;
    descripcion: string;
}

@Injectable({
    providedIn: 'root',
})
export class ProductService {
    private readonly products: Product[] = (itemsData as CatalogItem[]).map((item) => {
        const imageName = item.imagen.split('/').pop() ?? '';
        return {
            id: String(item.id),
            name: item.nombre,
            price: item.precio,
            description: item.descripcion,
            image: `/items_imgs/${imageName}`,
        };
    });

    getProducts(): Product[] {
        return this.products;
    }

    getProductById(id: string): Product | undefined {
        return this.products.find(p => p.id === id);
    }
}
