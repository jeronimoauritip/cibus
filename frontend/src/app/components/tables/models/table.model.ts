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
  isRadial: boolean;
  radialAngles: number[];
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
    const step = 360 / cap;
    const angles = Array.from({ length: cap }, (_, i) => Math.round(i * step));
    return {
      isRadial: true,
      radialAngles: angles,
      top: [],
      bottom: [],
      left: [],
      right: [],
    };
  }

  if (shape === 'square') {
    let top = 0;
    let bottom = 0;
    let left = 0;
    let right = 0;

    for (let i = 0; i < cap; i++) {
      const side = i % 4;
      if (side === 0) top++;
      else if (side === 1) bottom++;
      else if (side === 2) left++;
      else right++;
    }

    return {
      isRadial: false,
      radialAngles: [],
      top: Array.from({ length: top }, (_, i) => i),
      bottom: Array.from({ length: bottom }, (_, i) => i),
      left: Array.from({ length: left }, (_, i) => i),
      right: Array.from({ length: right }, (_, i) => i),
    };
  }

  // Rectangular shape
  if (cap === 1) return { isRadial: false, radialAngles: [], top: [0], bottom: [], left: [], right: [] };
  if (cap === 2) return { isRadial: false, radialAngles: [], top: [0], bottom: [0], left: [], right: [] };
  if (cap === 3) return { isRadial: false, radialAngles: [], top: [0], bottom: [0], left: [0], right: [] };
  if (cap === 4) return { isRadial: false, radialAngles: [], top: [0], bottom: [0], left: [0], right: [0] };
  const alongSides = Math.max(2, Math.floor((cap - 2) / 2));
  return {
    isRadial: false,
    radialAngles: [],
    top: Array.from({ length: alongSides }, (_, i) => i),
    bottom: Array.from({ length: alongSides }, (_, i) => i),
    left: [0],
    right: [0],
  };
}
