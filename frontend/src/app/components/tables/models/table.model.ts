import { OrderDetail } from '../../orders/models/order-detail';

export type TableVisualState = 'available' | 'occupied' | 'preparing' | 'ready' | 'served';
export type TableFilterMode = 'all' | 'available' | 'occupied' | 'ready';
export type TableShape = 'square' | 'rectangular' | 'round';

export interface BranchTable {
  id: number;
  number: number;
  capacity: number;
  available: boolean;
  posX: number;
  posY: number;
  shape?: TableShape;
  waiterId: number | null;
  branchId: number;
}

export interface TableCreateRequest {
  number: number;
  capacity: number;
  posX: number;
  posY: number;
  shape?: TableShape;
}

export interface TableUpdateRequest {
  number?: number;
  capacity?: number;
  waiterId?: number | null;
  posX?: number;
  posY?: number;
  shape?: TableShape;
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

export interface ChairDistribution {
  top: number[];
  bottom: number[];
  left: number[];
  right: number[];
}

/**
 * Calculates representative chairs distributed around the table
 * according to the chosen shape and capacity.
 */
export function calculateChairs(shape: TableShape = 'round', capacity: number = 4): ChairDistribution {
  const cap = Math.max(1, capacity);

  if (shape === 'round') {
    if (cap === 1) return { top: [0], bottom: [], left: [], right: [] };
    if (cap === 2) return { top: [0], bottom: [0], left: [], right: [] };
    if (cap === 3) return { top: [0], bottom: [0], left: [0], right: [] };
    if (cap === 4) return { top: [0], bottom: [0], left: [0], right: [0] };
    if (cap === 5) return { top: [0, 1], bottom: [0, 1], left: [0], right: [] };
    if (cap === 6) return { top: [0, 1], bottom: [0, 1], left: [0], right: [0] };
    const longSide = Math.max(2, Math.floor((cap - 2) / 2));
    return {
      top: Array.from({ length: longSide }, (_, i) => i),
      bottom: Array.from({ length: longSide }, (_, i) => i),
      left: [0],
      right: [0],
    };
  }

  if (shape === 'square') {
    if (cap === 1) return { top: [0], bottom: [], left: [], right: [] };
    if (cap <= 2) return { top: [0], bottom: [0], left: [], right: [] };
    if (cap === 3) return { top: [0], bottom: [0], left: [0], right: [] };
    if (cap === 4) return { top: [0], bottom: [0], left: [0], right: [0] };
    if (cap <= 6) return { top: [0, 1], bottom: [0, 1], left: [0], right: [0] };
    const pairs = Math.max(2, Math.floor(cap / 4));
    return {
      top: Array.from({ length: pairs }, (_, i) => i),
      bottom: Array.from({ length: pairs }, (_, i) => i),
      left: Array.from({ length: pairs }, (_, i) => i),
      right: Array.from({ length: pairs }, (_, i) => i),
    };
  }

  // Rectangular shape
  if (cap === 1) return { top: [0], bottom: [], left: [], right: [] };
  if (cap === 2) return { top: [0], bottom: [0], left: [], right: [] };
  if (cap === 3) return { top: [0], bottom: [0], left: [0], right: [] };
  if (cap === 4) return { top: [0], bottom: [0], left: [0], right: [0] };
  const alongSides = Math.max(2, Math.floor((cap - 2) / 2));
  return {
    top: Array.from({ length: alongSides }, (_, i) => i),
    bottom: Array.from({ length: alongSides }, (_, i) => i),
    left: [0],
    right: [0],
  };
}
