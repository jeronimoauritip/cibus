import { Product } from '../../products/models/product';

export interface BranchProduct {
    id: number;
    available: boolean;
    price: number;
    branchId: number;
    branchName: string;
    product: Product;
}
