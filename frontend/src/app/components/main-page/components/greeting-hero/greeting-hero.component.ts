import { Component, computed, inject } from '@angular/core';
import { MainPageStore } from '../../services/main-page.store';

@Component({
  selector: 'app-greeting-hero',
  standalone: true,
  template: `
    <header class="hero-container" role="banner">
      <!-- Decoración de campana Cibus de fondo -->
      <div class="cloche-silhouette" aria-hidden="true">
        <div class="cloche-handle"></div>
        <div class="cloche-dome"></div>
      </div>

      <div class="hero-content">
        <div class="hero-text-block">
          <span class="hero-greeting">{{ greeting() }}</span>
          <p class="hero-date">{{ formattedDate() }}</p>
        </div>

        <!-- Píldoras de métricas rápidas -->
        <div class="stats-pills" role="region" aria-label="Métricas generales del restaurante">
          <div class="stat-pill">
            <span class="stat-number">{{ store.globalStats().totalBranches }}</span>
            <span class="stat-label">sucursales</span>
          </div>

          <div class="stat-pill">
            <span class="stat-number">
              {{ store.globalStats().totalOccupied }}/{{ store.globalStats().totalTables }}
            </span>
            <span class="stat-label">mesas ocupadas</span>
          </div>

          <div class="stat-pill highlight">
            <span class="stat-number">{{ store.globalStats().occupancyPercent }}%</span>
            <span class="stat-label">ocupación</span>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .hero-container {
      position: relative;
      background: linear-gradient(115deg, var(--verde-900), var(--verde-oscuro) 45%, var(--verde-fondo));
      border-radius: var(--radio-xl);
      padding: clamp(24px, 4vw, 36px) clamp(20px, 4vw, 36px);
      color: #f8f5e9;
      overflow: hidden;
      box-shadow: var(--sombra-card);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Silueta estilizada de la campana en la esquina */
    .cloche-silhouette {
      position: absolute;
      right: -20px;
      bottom: -30px;
      width: 260px;
      height: 200px;
      pointer-events: none;
      opacity: 0.12;
    }

    .cloche-handle {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 32px;
      height: 20px;
      border: 5px solid #ffffff;
      border-bottom: none;
      border-radius: 16px 16px 0 0;
    }

    .cloche-dome {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 160px;
      border-radius: 130px 130px 0 0;
      background: #ffffff;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    @media (min-width: 768px) {
      .hero-content {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }

    .hero-greeting {
      font-family: var(--fuente-display);
      font-size: clamp(30px, 5vw, 42px);
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -1px;
      display: block;
    }

    .hero-date {
      margin: 6px 0 0 0;
      font-size: 15px;
      color: var(--icono);
      text-transform: capitalize;
      font-weight: 500;
    }

    .stats-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .stat-pill {
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: var(--radio-md);
      padding: 12px 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 95px;
      flex: 1;
      transition: transform var(--dur-rapida) var(--ease-smooth);
    }

    @media (min-width: 600px) {
      .stat-pill {
        flex: initial;
        min-width: 110px;
      }
    }

    .stat-pill:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.18);
    }

    .stat-pill.highlight {
      background: rgba(56, 154, 110, 0.35);
      border-color: rgba(56, 154, 110, 0.5);
    }

    .stat-number {
      font-size: clamp(20px, 3vw, 24px);
      font-weight: 800;
      line-height: 1.1;
      font-variant-numeric: tabular-nums;
      color: #ffffff;
    }

    .stat-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--icono);
      font-weight: 600;
      margin-top: 4px;
      text-align: center;
    }
  `]
})
export class GreetingHeroComponent {
  readonly store = inject(MainPageStore);

  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'Buen día';
    if (hour >= 12 && hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  });

  readonly formattedDate = computed(() => {
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(new Date());
  });
}
