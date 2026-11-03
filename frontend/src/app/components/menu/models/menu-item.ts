import { Product } from "../../products/models/product";

export interface MenuItem {
    id: number;
    available: boolean;
    price: number;
    product: Product;
}

export interface MenuItemRequest {
    productId: number;
    price: number;
}

export interface MenuItemUpdate {
    available: boolean;
    price: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
