import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MainPageStore } from '../../services/main-page.store';
import { MainIconComponent } from '../icon/icon.component';
import { BranchCardComponent } from '../branch-card/branch-card.component';

@Component({
  selector: 'app-branch-mosaic',
  standalone: true,
  imports: [
    RouterLink,
    MainIconComponent,
    BranchCardComponent
  ],
  template: `
    <section class="mosaic-section" aria-labelledby="section-sucursales">
      <!-- Barra de herramientas de la sección -->
      <div class="mosaic-toolbar">
        <div class="toolbar-left">
          <h2 id="section-sucursales" class="section-title">Sucursales</h2>

          <!-- Pestañas de filtrado suave -->
          <div class="filter-pills" role="tablist" aria-label="Filtrar sucursales">
            <button
              type="button"
              role="tab"
              class="pill-btn"
              [class.active]="store.activeFilter() === 'all'"
              [attr.aria-selected]="store.activeFilter() === 'all'"
              (click)="store.setFilter('all')"
            >
              Todas ({{ store.branchOverviews().length }})
            </button>
            <button
              type="button"
              role="tab"
              class="pill-btn"
              [class.active]="store.activeFilter() === 'active'"
              [attr.aria-selected]="store.activeFilter() === 'active'"
              (click)="store.setFilter('active')"
            >
              Con actividad ({{ store.globalStats().activeBranches }})
            </button>
          </div>
        </div>

        <!-- Botón de acción principal: Crear nueva sucursal -->
        <a
          routerLink="/branches"
          class="btn-new-branch"
          id="btn-nueva-sucursal"
          aria-label="Registrar nueva sucursal"
        >
          <app-main-icon name="plus" [size]="18" />
          <span>Nueva sucursal</span>
        </a>
      </div>

      <!-- Estado de carga (Skeleton) -->
      @if (store.isLoading()) {
        <div class="mosaic-grid" aria-busy="true" aria-label="Cargando sucursales">
          @for (n of [1, 2, 3]; track n) {
            <div class="skeleton-card">
              <div class="skeleton-line title"></div>
              <div class="skeleton-line subtitle"></div>
              <div class="skeleton-map"></div>
              <div class="skeleton-line progress"></div>
            </div>
          }
        </div>
      }

      <!-- Estado de error -->
      @else if (store.errorMessage()) {
        <div class="state-box error-box" role="alert">
          <app-main-icon name="refresh" [size]="32" class="error-icon" />
          <p class="error-text">{{ store.errorMessage() }}</p>
          <button type="button" class="btn-retry" (click)="store.retry()">
            Reintentar
          </button>
        </div>
      }

      <!-- Estado vacío -->
      @else if (store.filteredOverviews().length === 0) {
        <div class="state-box empty-box">
          <app-main-icon name="building" [size]="36" class="empty-icon" />
          <h3 class="empty-title">No hay sucursales disponibles</h3>
          <p class="empty-desc">
            @if (store.activeFilter() === 'active') {
              Ninguna sucursal registra actividad en este momento.
            } @else {
              Aún no se han configurado sucursales en el sistema.
            }
          </p>
          <a routerLink="/branches" class="btn-new-branch">
            <app-main-icon name="plus" [size]="18" />
            <span>Crear la primera sucursal</span>
          </a>
        </div>
      }

      <!-- Cuadrícula de sucursales -->
      @else {
        <div class="mosaic-grid">
          @for (branch of store.filteredOverviews(); track branch.id) {
            <app-branch-card [branch]="branch" />
          }
        </div>
      }
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .mosaic-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: 100%;
    }

    .mosaic-toolbar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .section-title {
      margin: 0;
      font-family: var(--fuente-display);
      font-size: clamp(24px, 4vw, 30px);
      font-weight: 700;
      color: var(--texto-principal);
      letter-spacing: -0.6px;
    }

    .filter-pills {
      display: inline-flex;
      background: rgba(32, 90, 64, 0.08);
      padding: 4px;
      border-radius: var(--radio-pill);
      gap: 4px;
    }

    .pill-btn {
      background: transparent;
      border: none;
      padding: 6px 14px;
      border-radius: var(--radio-pill);
      font-size: 13px;
      font-weight: 600;
      color: var(--texto-secundario);
      cursor: pointer;
      transition: all var(--dur-rapida) var(--ease-smooth);
    }

    .pill-btn:hover {
      color: var(--texto-principal);
    }

    .pill-btn.active {
      background: var(--crema-50);
      color: var(--verde-oscuro);
      box-shadow: 0 2px 6px rgba(32, 90, 64, 0.1);
    }

    .btn-new-branch {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: linear-gradient(100deg, var(--verde-oscuro), var(--verde-fondo));
      color: #f8f5e9;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      border-radius: var(--radio-pill);
      box-shadow: 0 4px 12px rgba(32, 90, 64, 0.2);
      transition: transform var(--dur-normal) var(--ease-smooth),
                  box-shadow var(--dur-normal) var(--ease-smooth);
    }

    .btn-new-branch:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(32, 90, 64, 0.3);
    }

    .btn-new-branch:active {
      transform: translateY(0);
    }

    .mosaic-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      width: 100%;
    }

    @media (min-width: 680px) {
      .mosaic-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1100px) {
      .mosaic-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    /* Skeletons */
    .skeleton-card {
      background: rgba(255, 255, 255, 0.5);
      border-radius: var(--radio-lg);
      padding: 24px;
      border: 1px solid rgba(32, 90, 64, 0.08);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .skeleton-line {
      background: linear-gradient(90deg, #e7dbbf 25%, #f4edd9 50%, #e7dbbf 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radio-pill);
    }

    .skeleton-line.title {
      height: 22px;
      width: 60%;
    }

    .skeleton-line.subtitle {
      height: 14px;
      width: 40%;
    }

    .skeleton-map {
      height: 150px;
      border-radius: var(--radio-sm);
      background: linear-gradient(90deg, #e7dbbf 25%, #f4edd9 50%, #e7dbbf 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-line.progress {
      height: 8px;
      width: 100%;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Estados vacíos y error */
    .state-box {
      background: var(--crema-50);
      border-radius: var(--radio-lg);
      padding: 48px 24px;
      text-align: center;
      border: 1px dashed rgba(32, 90, 64, 0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .empty-icon {
      color: var(--icono);
    }

    .empty-title {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: var(--texto-principal);
    }

    .empty-desc {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: var(--texto-secundario);
      max-width: 400px;
    }

    .error-box {
      background: #fdf2f0;
      border-color: #e5a498;
    }

    .error-icon {
      color: #b94b39;
    }

    .error-text {
      color: #922f1f;
      font-weight: 600;
      margin: 0;
    }

    .btn-retry {
      background: #922f1f;
      color: white;
      border: none;
      padding: 8px 18px;
      border-radius: var(--radio-pill);
      font-weight: 600;
      cursor: pointer;
    }
  `]
})
export class BranchMosaicComponent {
  readonly store = inject(MainPageStore);
}
