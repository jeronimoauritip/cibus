export interface Product {
    id: number;
    name:string;
    description?: string;
    categoryName: string;
}

export interface ProductRequest {
    name:string;
    description?:string|null;
    categoryId:number;
}

export interface ProductCategory {
    id:number;
    name:string;
}
