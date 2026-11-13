import { OrderDetail } from "./order-detail";
import { OrderStatus } from "./order-status";
export interface OrderResponse {
    id:number;
    branchId: number;
    branchName: string;
    tableNumber: number;
    waiterId: number;
    waiterFirstName: string;
    waiterLastName:string;
    status: OrderStatus;
    createdAt: string;
    closedAt?: string | null;
    subtotal:number;
    discount:number;
    finalTotal:number;
    remainingAmount:number;
    items: OrderDetail[];
}
