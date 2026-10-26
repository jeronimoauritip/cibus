import { TablePreview } from './table-preview.model';

export interface BranchOverview {
  id: number;
  name: string;
  street: string;
  number: number;
  tables: TablePreview[];
  totalTables: number;
  occupiedTables: number;
  availableTables: number;
  occupancyPercent: number;
  status: 'active' | 'idle';
}
