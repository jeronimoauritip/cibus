import { Component, computed, input } from '@angular/core';
import { TablePreview } from '../../models/table-preview.model';

@Component({
  selector: 'app-table-map-preview',
  standalone: true,
  template: `
    <div class="map-card" [attr.aria-label]="ariaLabel()">
      <svg
        class="floor-plan-svg"
        viewBox="0 0 100 68"
        preserveAspectRatio="xMidYMid meet"
        role="img"
      >
        <defs>
          <!-- Patrón de cuadrícula de puntos arquitectónica -->
          <pattern id="dot-grid" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.75" fill="rgba(32, 90, 64, 0.15)" />
          </pattern>
        </defs>

        <!-- Fondo con cuadrícula -->
        <rect x="0" y="0" width="100" height="68" rx="6" fill="#f5eedc" />
        <rect x="0" y="0" width="100" height="68" rx="6" fill="url(#dot-grid)" />

        <!-- Borde sutil del plano -->
        <rect x="1" y="1" width="98" height="66" rx="5" fill="none" stroke="rgba(32, 90, 64, 0.2)" stroke-width="0.8" />

        <!-- Mesas dispuestas espacialmente -->
        @for (table of normalizedTables(); track table.id) {
          <g
            class="table-node"
            [class.occupied]="!table.available"
            [class.available]="table.available"
            [attr.transform]="'translate(' + table.x + ',' + table.y + ')'"
          >
            <title>Mesa {{ table.number }} ({{ table.capacity }} personas) - {{ table.available ? 'Libre' : 'Ocupada' }}</title>

            @if (table.capacity <= 2) {
              <!-- Mesa redonda pequeña (2 personas) -->
              <circle
                cx="0"
                cy="0"
                r="4.2"
                class="table-shape"
              />
            } @else if (table.capacity >= 6) {
              <!-- Mesa comunal rectangular (6+ personas) -->
              <rect
                x="-8"
                y="-4.5"
                width="16"
                height="9"
                rx="2.5"
                class="table-shape"
              />
            } @else {
              <!-- Mesa estándar cuadrada (4 personas) -->
              <rect
                x="-5"
                y="-5"
                width="10"
                height="10"
                rx="2.5"
                class="table-shape"
              />
            }

            <!-- Número de mesa discreto dentro -->
            <text
              x="0"
              y="0"
              class="table-number"
              dominant-baseline="central"
              text-anchor="middle"
            >
              {{ table.number }}
            </text>
          </g>
        }
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .map-card {
      width: 100%;
      border-radius: var(--radio-sm);
      overflow: hidden;
      background: #f5eedc;
      box-shadow: inset 0 1px 3px rgba(32, 90, 64, 0.08);
      border: 1px solid rgba(32, 90, 64, 0.12);
      transition: border-color var(--dur-normal) var(--ease-smooth);
    }

    .map-card:hover {
      border-color: rgba(32, 90, 64, 0.25);
    }

    .floor-plan-svg {
      display: block;
      width: 100%;
      height: auto;
      max-height: 180px;
      user-select: none;
    }

    .table-node {
      cursor: pointer;
      transition: transform var(--dur-rapida) var(--ease-bounce);
    }

    .table-node:hover {
      transform: scale(1.15) !important;
    }

    .table-shape {
      stroke-width: 0.9;
      transition: fill var(--dur-lenta) var(--ease-smooth),
                  stroke var(--dur-lenta) var(--ease-smooth);
    }

    .table-node.available .table-shape {
      fill: var(--mesa-libre, #389a6e);
      stroke: #267351;
    }

    .table-node.occupied .table-shape {
      fill: var(--mesa-ocupada, #c4663a);
      stroke: #9d4822;
    }

    .table-number {
      font-size: 3.4px;
      font-weight: 700;
      fill: #ffffff;
      pointer-events: none;
      font-family: var(--fuente-texto);
    }
  `]
})
export class TableMapPreviewComponent {
  readonly tables = input.required<TablePreview[]>();
  readonly branchName = input<string>('Sucursal');

  readonly normalizedTables = computed(() => {
    return this.tables().map(t => ({
      ...t,
      // Normalizar posX y posY para que se ajusten bien dentro del viewBox 100x68
      x: Math.max(8, Math.min(92, t.posX)),
      y: Math.max(8, Math.min(60, (t.posY / 100) * 68))
    }));
  });

  readonly ariaLabel = computed(() => {
    const list = this.tables();
    const occupied = list.filter(t => !t.available).length;
    return `Mapa de mesas en tiempo real de ${this.branchName()}: ${occupied} de ${list.length} mesas ocupadas`;
  });
}
