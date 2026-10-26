import { Injectable } from '@angular/core';
import { Observable, interval, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TablePreview } from '../models/table-preview.model';
import { TablePreviewSource } from './table-preview.source';

interface BaseTableTemplate {
  number: number;
  capacity: number;
  posX: number;
  posY: number;
  initialAvailable: boolean;
}

const TEMPLATES_BY_BRANCH: Record<number, BaseTableTemplate[]> = {
  1: [ // Sucursal Centro (14 mesas)
    { number: 1, capacity: 2, posX: 14, posY: 18, initialAvailable: true },
    { number: 2, capacity: 2, posX: 38, posY: 18, initialAvailable: false },
    { number: 3, capacity: 4, posX: 62, posY: 18, initialAvailable: true },
    { number: 4, capacity: 4, posX: 86, posY: 18, initialAvailable: false },
    { number: 5, capacity: 4, posX: 14, posY: 48, initialAvailable: false },
    { number: 6, capacity: 6, posX: 38, posY: 48, initialAvailable: true },
    { number: 7, capacity: 4, posX: 62, posY: 48, initialAvailable: false },
    { number: 8, capacity: 2, posX: 86, posY: 48, initialAvailable: true },
    { number: 9, capacity: 4, posX: 14, posY: 78, initialAvailable: true },
    { number: 10, capacity: 4, posX: 38, posY: 78, initialAvailable: false },
    { number: 11, capacity: 6, posX: 62, posY: 78, initialAvailable: true },
    { number: 12, capacity: 2, posX: 86, posY: 78, initialAvailable: false },
    { number: 13, capacity: 2, posX: 26, posY: 33, initialAvailable: true },
    { number: 14, capacity: 2, posX: 74, posY: 63, initialAvailable: false },
  ],
  2: [ // Sucursal Norte (12 mesas)
    { number: 1, capacity: 4, posX: 16, posY: 20, initialAvailable: true },
    { number: 2, capacity: 4, posX: 50, posY: 20, initialAvailable: false },
    { number: 3, capacity: 6, posX: 84, posY: 20, initialAvailable: true },
    { number: 4, capacity: 2, posX: 16, posY: 50, initialAvailable: true },
    { number: 5, capacity: 2, posX: 50, posY: 50, initialAvailable: true },
    { number: 6, capacity: 4, posX: 84, posY: 50, initialAvailable: false },
    { number: 7, capacity: 4, posX: 16, posY: 80, initialAvailable: false },
    { number: 8, capacity: 6, posX: 50, posY: 80, initialAvailable: true },
    { number: 9, capacity: 4, posX: 84, posY: 80, initialAvailable: false },
    { number: 10, capacity: 2, posX: 33, posY: 35, initialAvailable: true },
    { number: 11, capacity: 2, posX: 67, posY: 35, initialAvailable: false },
    { number: 12, capacity: 2, posX: 50, posY: 65, initialAvailable: true },
  ],
  3: [ // Sucursal Sur (10 mesas)
    { number: 1, capacity: 4, posX: 20, posY: 22, initialAvailable: false },
    { number: 2, capacity: 4, posX: 50, posY: 22, initialAvailable: true },
    { number: 3, capacity: 4, posX: 80, posY: 22, initialAvailable: false },
    { number: 4, capacity: 6, posX: 20, posY: 54, initialAvailable: true },
    { number: 5, capacity: 6, posX: 50, posY: 54, initialAvailable: false },
    { number: 6, capacity: 2, posX: 80, posY: 54, initialAvailable: true },
    { number: 7, capacity: 2, posX: 20, posY: 82, initialAvailable: true },
    { number: 8, capacity: 4, posX: 50, posY: 82, initialAvailable: true },
    { number: 9, capacity: 4, posX: 80, posY: 82, initialAvailable: false },
    { number: 10, capacity: 2, posX: 50, posY: 38, initialAvailable: false },
  ]
};

@Injectable({ providedIn: 'root' })
export class MockTablePreviewSource implements TablePreviewSource {
  private readonly branchTablesState = new Map<number, TablePreview[]>();

  constructor() {
    this.initializeAll();
  }

  private initializeAll(): void {
    Object.entries(TEMPLATES_BY_BRANCH).forEach(([branchIdStr, templates]) => {
      const branchId = Number(branchIdStr);
      const tables: TablePreview[] = templates.map((t, index) => ({
        id: branchId * 100 + t.number,
        number: t.number,
        capacity: t.capacity,
        available: t.initialAvailable,
        posX: t.posX,
        posY: t.posY,
        branchId,
        waiterId: t.initialAvailable ? null : ((index % 3) + 1)
      }));
      this.branchTablesState.set(branchId, tables);
    });
  }

  public getInitialTables(branchId: number): TablePreview[] {
    const existing = this.branchTablesState.get(branchId);
    if (existing) {
      return [...existing.map(t => ({ ...t }))];
    }
    // Generar fallback determinista si se crea una nueva sucursal
    return this.generateDefaultLayout(branchId);
  }

  public watch(branchId: number): Observable<TablePreview[]> {
    if (!this.branchTablesState.has(branchId)) {
      this.branchTablesState.set(branchId, this.generateDefaultLayout(branchId));
    }

    // Intervalo de pulso en vivo cada 4.5 segundos
    return interval(4500).pipe(
      startWith(0),
      map(() => {
        const current = this.branchTablesState.get(branchId) ?? [];
        if (current.length > 0) {
          // Cambiar el estado de 1 mesa al azar para simular actividad viva
          const targetIndex = Math.floor(Math.random() * current.length);
          const updated = current.map((table, idx) => {
            if (idx === targetIndex) {
              return {
                ...table,
                available: !table.available,
                waiterId: !table.available ? null : 1
              };
            }
            return table;
          });
          this.branchTablesState.set(branchId, updated);
          return [...updated];
        }
        return [];
      })
    );
  }

  private generateDefaultLayout(branchId: number): TablePreview[] {
    const count = 10;
    const result: TablePreview[] = [];
    const positions = [
      { x: 18, y: 22 }, { x: 50, y: 22 }, { x: 82, y: 22 },
      { x: 25, y: 52 }, { x: 75, y: 52 },
      { x: 18, y: 80 }, { x: 50, y: 80 }, { x: 82, y: 80 },
      { x: 50, y: 45 }, { x: 50, y: 65 }
    ];

    for (let i = 0; i < count; i++) {
      const pos = positions[i];
      result.push({
        id: branchId * 100 + (i + 1),
        number: i + 1,
        capacity: (i % 3 === 0) ? 6 : (i % 2 === 0 ? 2 : 4),
        available: (i % 2 === 0),
        posX: pos.x,
        posY: pos.y,
        branchId,
        waiterId: null
      });
    }
    return result;
  }
}
