export interface OrderDetail {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    observation?:string;
}
