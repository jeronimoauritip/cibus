import { Component } from '@angular/core';
import { TopBarComponent } from '../../components/top-bar/top-bar.component';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { GreetingHeroComponent } from '../../components/greeting-hero/greeting-hero.component';
import { BranchMosaicComponent } from '../../components/branch-mosaic/branch-mosaic.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    TopBarComponent,
    SideNavComponent,
    GreetingHeroComponent,
    BranchMosaicComponent
  ],
  template: `
    <div class="dashboard-layout">
      <!-- Riel lateral en Desktop y barra inferior en Mobile -->
      <app-side-nav />

      <!-- Área de contenido principal -->
      <div class="dashboard-body">
        <!-- Barra superior sticky con logo y perfil -->
        <app-top-bar />

        <main class="dashboard-main" id="main-content" role="main">
          <div class="content-wrapper">
            <!-- Saludo y métricas generales del restaurante -->
            <app-greeting-hero />

            <!-- Mosaico central de sucursales en vivo -->
            <app-branch-mosaic />
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
      background: var(--crema);
    }

    .dashboard-layout {
      display: flex;
      width: 100%;
      min-height: 100vh;
      background: var(--crema);
      position: relative;
    }

    .dashboard-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 100vh;
    }

    .dashboard-main {
      flex: 1;
      padding: clamp(16px, 3vw, 36px) clamp(16px, 3vw, 40px);
      /* Espacio inferior en mobile para que la barra fija no tape nada */
      padding-bottom: calc(90px + env(safe-area-inset-bottom, 0px));
    }

    @media (min-width: 1024px) {
      .dashboard-main {
        padding-bottom: 48px;
      }
    }

    .content-wrapper {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: clamp(24px, 4vw, 36px);
      animation: pageEntrance 0.35s var(--ease-smooth);
    }

    @keyframes pageEntrance {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class MainPageComponent {}
