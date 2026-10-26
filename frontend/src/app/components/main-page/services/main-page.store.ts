import { Injectable, computed, inject, signal } from '@angular/core';
import { Branch } from '../../branches/models/branch.model';
import { BranchService } from '../../branches/service/branch-service';
import { MAIN_PAGE_DATA_MODE, VIEWER_ROLE } from '../main-page.config';
import { MOCK_BRANCHES } from '../data/mock-branches';
import { BranchOverview } from '../models/branch-overview.model';
import { TablePreview } from '../models/table-preview.model';
import { MockTablePreviewSource } from './mock-table-preview.source';

@Injectable({ providedIn: 'root' })
export class MainPageStore {
  private readonly branchService = inject(BranchService);
  private readonly mockSource = inject(MockTablePreviewSource);
  readonly dataMode = inject(MAIN_PAGE_DATA_MODE);
  readonly viewerRole = inject(VIEWER_ROLE);

  // Signals de estado
  readonly branches = signal<Branch[]>([]);
  readonly tablesByBranch = signal<Record<number, TablePreview[]>>({});
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly activeFilter = signal<'all' | 'active'>('all');

  // Overviews computados por sucursal
  readonly branchOverviews = computed<BranchOverview[]>(() => {
    const rawBranches = this.branches();
    const tablesMap = this.tablesByBranch();

    return rawBranches.map(branch => {
      const branchId = branch.id ?? 0;
      const tables = tablesMap[branchId] ?? this.mockSource.getInitialTables(branchId);
      const totalTables = tables.length;
      const occupiedTables = tables.filter(t => !t.available).length;
      const availableTables = totalTables - occupiedTables;
      const occupancyPercent = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;
      const status: 'active' | 'idle' = occupiedTables > 0 ? 'active' : 'idle';

      return {
        id: branchId,
        name: branch.name,
        street: branch.street,
        number: branch.number,
        tables,
        totalTables,
        occupiedTables,
        availableTables,
        occupancyPercent,
        status
      };
    });
  });

  // Lista filtrada según pestaña seleccionada
  readonly filteredOverviews = computed<BranchOverview[]>(() => {
    const all = this.branchOverviews();
    if (this.activeFilter() === 'active') {
      return all.filter(b => b.status === 'active');
    }
    return all;
  });

  // Estadísticas globales del dashboard
  readonly globalStats = computed(() => {
    const overviews = this.branchOverviews();
    const totalBranches = overviews.length;
    const activeBranches = overviews.filter(b => b.status === 'active').length;
    const totalTables = overviews.reduce((acc, b) => acc + b.totalTables, 0);
    const totalOccupied = overviews.reduce((acc, b) => acc + b.occupiedTables, 0);
    const occupancyPercent = totalTables > 0 ? Math.round((totalOccupied / totalTables) * 100) : 0;

    return {
      totalBranches,
      activeBranches,
      totalTables,
      totalOccupied,
      occupancyPercent
    };
  });

  constructor() {
    this.init();
  }

  public init(): void {
    if (this.dataMode === 'mock') {
      this.loadMockBranches();
    } else {
      this.loadApiBranches();
    }
  }

  private loadMockBranches(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Inicializar tablas mock de inmediato
    const initialMap: Record<number, TablePreview[]> = {};
    MOCK_BRANCHES.forEach(b => {
      if (b.id) {
        initialMap[b.id] = this.mockSource.getInitialTables(b.id);
      }
    });

    this.branches.set(MOCK_BRANCHES);
    this.tablesByBranch.set(initialMap);
    this.isLoading.set(false);
  }

  public loadApiBranches(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.branchService.findAll().subscribe({
      next: data => {
        this.branches.set(data);
        const map: Record<number, TablePreview[]> = {};
        data.forEach(b => {
          if (b.id) {
            map[b.id] = this.mockSource.getInitialTables(b.id);
          }
        });
        this.tablesByBranch.set(map);
        this.isLoading.set(false);
      },
      error: err => {
        console.warn('API de sucursales falló, usando datos de demostración.', err);
        // Fallback suave a mock para que la pantalla nunca quede rota
        this.loadMockBranches();
      }
    });
  }

  public updateBranchTables(branchId: number, tables: TablePreview[]): void {
    this.tablesByBranch.update(prev => ({
      ...prev,
      [branchId]: tables
    }));
  }

  public setFilter(filter: 'all' | 'active'): void {
    this.activeFilter.set(filter);
  }

  public retry(): void {
    this.init();
  }
}
