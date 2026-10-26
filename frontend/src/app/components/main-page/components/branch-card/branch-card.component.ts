import { Component, OnInit, OnDestroy, inject, input, signal, computed } from '@angular/core';
import { Subscription } from 'rxjs';
import { BranchOverview } from '../../models/branch-overview.model';
import { TablePreview } from '../../models/table-preview.model';
import { MockTablePreviewSource } from '../../services/mock-table-preview.source';
import { MainPageStore } from '../../services/main-page.store';
import { MainIconComponent } from '../icon/icon.component';
import { TableMapPreviewComponent } from '../table-map-preview/table-map-preview.component';
import { OccupancyMeterComponent } from '../occupancy-meter/occupancy-meter.component';

@Component({
  selector: 'app-branch-card',
  standalone: true,
  imports: [
    MainIconComponent,
    TableMapPreviewComponent,
    OccupancyMeterComponent
  ],
  template: `
    <article class="branch-card" [class.active-branch]="isActive()">
      <!-- Encabezado de la tarjeta -->
      <header class="card-header">
        <div class="header-titles">
          <h3 class="branch-name">{{ branch().name }}</h3>
          <p class="branch-address">
            <app-main-icon name="pin" [size]="14" class="pin-icon" />
            <span>{{ branch().street }} {{ branch().number }}</span>
          </p>
        </div>

        <!-- Badge de estado en tiempo real -->
        <div class="live-badge" title="Monitoreo en tiempo real activo">
          <span class="live-dot" aria-hidden="true"></span>
          <span class="live-text">En vivo</span>
        </div>
      </header>

      <!-- Previsualización del mapa de mesas -->
      <div class="card-map-wrapper">
        <app-table-map-preview
          [tables]="liveTables()"
          [branchName]="branch().name"
        />
      </div>

      <!-- Leyenda de colores -->
      <div class="map-legend" aria-hidden="true">
        <div class="legend-item">
          <span class="legend-dot available"></span>
          <span>Libre</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot occupied"></span>
          <span>Ocupada</span>
        </div>
      </div>

      <!-- Medidor de ocupación -->
      <div class="meter-wrapper">
        <app-occupancy-meter
          [occupied]="currentOccupiedCount()"
          [total]="liveTables().length"
        />
      </div>

      <!-- Acciones de la tarjeta -->
      <footer class="card-footer">
        <button
          type="button"
          class="btn-card-action"
          disabled
          aria-disabled="true"
          title="Gestión de mesas en desarrollo"
        >
          <span>Ver mesas</span>
          <span class="action-tag">Pronto</span>
        </button>
      </footer>
    </article>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .branch-card {
      background: var(--crema-50);
      border-radius: var(--radio-lg);
      padding: 20px 22px;
      border: 1.5px solid rgba(32, 90, 64, 0.12);
      box-shadow: var(--sombra-card);
      transition: transform var(--dur-normal) var(--ease-smooth),
                  box-shadow var(--dur-normal) var(--ease-smooth),
                  border-color var(--dur-normal) var(--ease-smooth);
      display: flex;
      flex-direction: column;
      gap: 14px;
      position: relative;
    }

    .branch-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--sombra-card-hover);
      border-color: rgba(32, 90, 64, 0.3);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .header-titles {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .branch-name {
      margin: 0;
      font-family: var(--fuente-display);
      font-size: 20px;
      font-weight: 700;
      line-height: 1.2;
      color: var(--texto-principal);
      letter-spacing: -0.4px;
    }

    .branch-address {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 13px;
      color: var(--texto-secundario);
    }

    .pin-icon {
      color: var(--verde-fondo);
      flex-shrink: 0;
    }

    .live-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: var(--verde-100);
      border: 1px solid rgba(56, 154, 110, 0.3);
      border-radius: var(--radio-pill);
      font-size: 11px;
      font-weight: 700;
      color: var(--verde-oscuro);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }

    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--verde-claro);
      box-shadow: 0 0 0 0 rgba(56, 154, 110, 0.7);
      animation: livePulse 2.4s infinite;
    }

    @keyframes livePulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(56, 154, 110, 0.7);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 6px rgba(56, 154, 110, 0);
      }
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(56, 154, 110, 0);
      }
    }

    .card-map-wrapper {
      width: 100%;
    }

    .map-legend {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 12px;
      color: var(--texto-secundario);
    }

    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .legend-dot.available {
      background: var(--mesa-libre);
    }

    .legend-dot.occupied {
      background: var(--mesa-ocupada);
    }

    .meter-wrapper {
      padding-top: 2px;
    }

    .card-footer {
      border-top: 1px solid rgba(32, 90, 64, 0.08);
      padding-top: 12px;
      display: flex;
      justify-content: flex-end;
    }

    .btn-card-action {
      background: transparent;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--texto-secundario);
      font-size: 13px;
      font-weight: 600;
      cursor: not-allowed;
      opacity: 0.65;
      padding: 4px 8px;
      border-radius: var(--radio-xs);
      transition: opacity var(--dur-rapida);
    }

    .action-tag {
      font-size: 10px;
      background: rgba(32, 90, 64, 0.1);
      color: var(--verde-oscuro);
      padding: 2px 6px;
      border-radius: var(--radio-pill);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
  `]
})
export class BranchCardComponent implements OnInit, OnDestroy {
  readonly branch = input.required<BranchOverview>();
  private readonly mockSource = inject(MockTablePreviewSource);
  private readonly store = inject(MainPageStore);

  readonly liveTables = signal<TablePreview[]>([]);
  private liveSub?: Subscription;

  readonly isActive = computed(() => this.branch().status === 'active');

  readonly currentOccupiedCount = computed(() => {
    return this.liveTables().filter(t => !t.available).length;
  });

  ngOnInit(): void {
    // Inicializar con las mesas del overview
    this.liveTables.set(this.branch().tables);

    // Suscribirse a la fuente viva de mesas para esta sucursal
    this.liveSub = this.mockSource.watch(this.branch().id).subscribe(tables => {
      this.liveTables.set(tables);
      this.store.updateBranchTables(this.branch().id, tables);
    });
  }

  ngOnDestroy(): void {
    this.liveSub?.unsubscribe();
  }
}
