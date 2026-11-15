import { OrderPayment } from './order-payment';
import { OrderResponse } from './order-response';

export interface TableBill {
  branchId: number;
  branchName: string;
  tableNumber: number;
  waiterId: number | null;
  waiterFirstName: string | null;
  waiterLastName: string | null;
  openedAt: string | null;
  closedAt?: string | null;
  allServed: boolean;
  subtotal: number;
  discount: number;
  finalTotal: number;
  totalPaid: number;
  remainingAmount: number;
  orders: OrderResponse[];
  payments: OrderPayment[];
}

export interface TableCheckoutRequest {
  orderIds?: number[];
  discount?: number;
  payments: OrderPayment[];
}

