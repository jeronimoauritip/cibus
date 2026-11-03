import { OrderDetail } from '../../orders/models/order-detail';

export type TableVisualState = 'available' | 'occupied' | 'preparing' | 'ready' | 'served';
export type TableFilterMode = 'all' | 'available' | 'occupied' | 'ready';

export interface BranchTable {
  id: number;
  number: number;
  capacity: number;
  available: boolean;
  posX: number;
  posY: number;
  waiterId: number | null;
  branchId: number;
}

export interface TableCreateRequest {
  number: number;
  capacity: number;
  posX: number;
  posY: number;
}

export interface TableUpdateRequest {
  number?: number;
  capacity?: number;
  waiterId?: number | null;
  posX?: number;
  posY?: number;
}

export interface TableOrder {
  id: number;
  branchId: number;
  branchName: string;
  tableNumber: number;
  waiterId: number;
  waiterFirstName: string;
  waiterLastName: string;
  status: string;
  createdAt: string;
  closedAt?: string | null;
  subtotal: number;
  discount: number;
  finalTotal: number;
  remainingAmount: number;
  items: OrderDetail[];
}

export interface AssignableWaiterOption {
  id: number;
  fullName: string;
  roleLabel: string;
  servingCount: number;
  isSelf: boolean;
}

