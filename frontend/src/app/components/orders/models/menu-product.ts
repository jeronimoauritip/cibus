import { Product } from '../../products/models/product';

export interface MenuProduct extends Product {
    price: number;
    available: boolean;
}
