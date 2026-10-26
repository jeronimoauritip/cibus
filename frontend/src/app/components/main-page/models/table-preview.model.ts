/**
 * Espejo exacto del TableResponseDTO del backend:
 * { id, number, capacity, available, posX, posY, waiterId, branchId }
 */
export interface TablePreview {
  id: number;
  number: number;
  capacity: number;
  available: boolean;
  posX: number;
  posY: number;
  waiterId?: number | null;
  branchId: number;
}
