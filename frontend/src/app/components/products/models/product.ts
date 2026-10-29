export interface Product {
    id: number;
    name:string;
    description?: string;
    categoryName: string;
    price: number;
    available?: boolean;
}
