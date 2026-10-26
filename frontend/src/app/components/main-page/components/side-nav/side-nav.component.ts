import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MAIN_NAV_ITEMS } from '../../data/nav-items';
import { NavItem } from '../../models/nav-item.model';
import { MainIconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MainIconComponent],
  template: `
    <!-- Navegación lateral en Desktop -->
    <nav class="desktop-rail" aria-label="Menú principal de navegación">
      <div class="rail-header">
        <a routerLink="/home" class="rail-brand">
          <span class="cloche-dot" aria-hidden="true"></span>
          <span>cibus</span>
        </a>
      </div>

      <div class="rail-nav-list" role="menubar">
        @for (item of navItems; track item.id) {
          @if (item.enabled && item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.route === '/home' }"
              class="rail-item enabled"
              role="menuitem"
            >
              <app-main-icon [name]="item.icon" [size]="20" class="rail-icon" />
              <span class="rail-label">{{ item.label }}</span>
            </a>
          } @else {
            <button
              type="button"
              class="rail-item disabled"
              (click)="showComingSoon(item.label)"
              [attr.aria-disabled]="true"
              role="menuitem"
            >
              <app-main-icon [name]="item.icon" [size]="20" class="rail-icon" />
              <span class="rail-label">{{ item.label }}</span>
              <span class="soon-badge">Pronto</span>
            </button>
          }
        }
      </div>

      <div class="rail-footer">
        <span>v1.0.0</span>
      </div>
    </nav>

    <!-- Barra inferior fija en Mobile -->
    <nav class="mobile-tab-bar" aria-label="Navegación móvil">
      <a
        routerLink="/home"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
        class="tab-item"
      >
        <app-main-icon name="home" [size]="22" />
        <span class="tab-label">Inicio</span>
      </a>

      <a
        routerLink="/branches"
        routerLinkActive="active"
        class="tab-item"
      >
        <app-main-icon name="building" [size]="22" />
        <span class="tab-label">Sucursales</span>
      </a>

      <a
        routerLink="/users"
        routerLinkActive="active"
        class="tab-item"
      >
        <app-main-icon name="users" [size]="22" />
        <span class="tab-label">Empleados</span>
      </a>

      <button
        type="button"
        class="tab-item disabled-tab"
        (click)="showComingSoon('Mesas')"
      >
        <app-main-icon name="table" [size]="22" />
        <span class="tab-label">Mesas</span>
      </button>

      <button
        type="button"
        class="tab-item"
        (click)="toggleMoreMenu()"
        [attr.aria-expanded]="isMoreOpen()"
      >
        <app-main-icon name="dots" [size]="22" />
        <span class="tab-label">Más</span>
      </button>
    </nav>

    <!-- Bottom Sheet para menú "Más" en Mobile -->
    @if (isMoreOpen()) {
      <div class="sheet-backdrop" (click)="isMoreOpen.set(false)" aria-hidden="true"></div>
      <div class="bottom-sheet" role="dialog" aria-modal="true" aria-label="Más funciones">
        <div class="sheet-handle"></div>
        <div class="sheet-header">
          <h3 class="sheet-title">Funcionalidades del sistema</h3>
          <button type="button" class="btn-close-sheet" (click)="isMoreOpen.set(false)">✕</button>
        </div>
        <div class="sheet-list">
          @for (item of extraItems; track item.id) {
            <button
              type="button"
              class="sheet-item"
              (click)="showComingSoon(item.label); isMoreOpen.set(false)"
            >
              <div class="sheet-item-left">
                <app-main-icon [name]="item.icon" [size]="22" class="sheet-icon" />
                <div class="sheet-item-texts">
                  <span class="sheet-item-title">{{ item.label }}</span>
                  <span class="sheet-item-desc">{{ item.description }}</span>
                </div>
              </div>
              <span class="soon-badge">Pronto</span>
            </button>
          }
        </div>
      </div>
    }

    <!-- Toast "Próximamente" -->
    @if (toastMessage()) {
      <div class="toast-notice" role="status" aria-live="polite">
        <app-main-icon name="bell" [size]="18" />
        <span>{{ toastMessage() }}</span>
      </div>
    }
  `,
  styles: [`
    .desktop-rail { display: none; }

    @media (min-width: 1024px) {
      .desktop-rail {
        display: flex;
        flex-direction: column;
        width: 250px;
        min-height: 100vh;
        background: linear-gradient(180deg, var(--verde-900), var(--verde-oscuro));
        color: #f8f5e9;
        padding: 28px 18px;
        position: sticky;
        top: 0;
        height: 100vh;
        box-shadow: 4px 0 24px rgba(20, 59, 42, 0.25);
        z-index: 50;
      }
    }

    .rail-header { padding: 0 12px 28px; }

    .rail-brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: #f8f5e9;
      text-decoration: none;
      font-family: var(--fuente-display);
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -1.2px;
    }

    .cloche-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--verde-claro);
      box-shadow: 0 0 12px rgba(56, 154, 110, 0.8);
    }

    .rail-nav-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .rail-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 16px;
      border-radius: var(--radio-md);
      text-decoration: none;
      color: rgba(248, 245, 233, 0.8);
      font-size: 15px;
      font-weight: 600;
      background: transparent;
      border: none;
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: all var(--dur-rapida) var(--ease-smooth);
    }

    .rail-item.enabled:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      transform: translateX(3px);
    }

    .rail-item.enabled.active {
      background: var(--crema-50);
      color: var(--verde-oscuro);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
    }

    .rail-item.disabled {
      opacity: 0.5;
      justify-content: space-between;
    }

    .rail-item.disabled:hover {
      opacity: 0.85;
      background: rgba(255, 255, 255, 0.05);
    }

    .soon-badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3px 8px;
      border-radius: var(--radio-pill);
      background: rgba(255, 255, 255, 0.15);
      color: #f8f5e9;
    }

    .rail-footer { padding: 12px; color: var(--icono); font-size: 12px; }

    /* Mobile Bar */
    .mobile-tab-bar {
      display: flex;
      justify-content: space-around;
      align-items: center;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(248, 245, 233, 0.95);
      backdrop-filter: blur(16px);
      border-top: 1px solid rgba(32, 90, 64, 0.15);
      padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px));
      z-index: 60;
      box-shadow: 0 -4px 20px rgba(32, 90, 64, 0.08);
    }

    @media (min-width: 1024px) { .mobile-tab-bar { display: none; } }

    .tab-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: transparent;
      border: none;
      text-decoration: none;
      color: var(--texto-secundario);
      padding: 6px 10px;
      border-radius: var(--radio-sm);
      cursor: pointer;
      min-width: 58px;
    }

    .tab-item.active { color: var(--verde-oscuro); font-weight: 700; }
    .tab-item.disabled-tab { opacity: 0.5; }
    .tab-label { font-size: 11px; }

    /* Bottom Sheet */
    .sheet-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(14, 38, 27, 0.5);
      z-index: 70;
    }

    .bottom-sheet {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--crema-50);
      border-radius: var(--radio-xl) var(--radio-xl) 0 0;
      padding: 16px 20px calc(24px + env(safe-area-inset-bottom, 0px));
      z-index: 80;
      box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.2);
      max-height: 80vh;
      overflow-y: auto;
    }

    .sheet-handle {
      width: 44px;
      height: 4px;
      border-radius: var(--radio-pill);
      background: rgba(32, 90, 64, 0.2);
      margin: 0 auto 16px;
    }

    .sheet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .sheet-title {
      margin: 0;
      font-family: var(--fuente-display);
      font-size: 18px;
      font-weight: 700;
      color: var(--texto-principal);
    }

    .btn-close-sheet {
      background: transparent;
      border: none;
      font-size: 18px;
      color: var(--texto-secundario);
      cursor: pointer;
    }

    .sheet-list { display: flex; flex-direction: column; gap: 10px; }

    .sheet-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      background: #f5eedc;
      border: 1px solid rgba(32, 90, 64, 0.1);
      border-radius: var(--radio-md);
      cursor: pointer;
      text-align: left;
    }

    .sheet-item-left { display: flex; align-items: center; gap: 12px; }
    .sheet-icon { color: var(--verde-fondo); }
    .sheet-item-texts { display: flex; flex-direction: column; }
    .sheet-item-title { font-size: 14px; font-weight: 700; color: var(--texto-principal); }
    .sheet-item-desc { font-size: 12px; color: var(--texto-secundario); }

    /* Toast */
    .toast-notice {
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--verde-oscuro);
      color: #f8f5e9;
      padding: 10px 18px;
      border-radius: var(--radio-pill);
      font-size: 13px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      z-index: 100;
    }

    @media (min-width: 1024px) {
      .toast-notice { bottom: 30px; left: calc(250px + (100% - 250px) / 2); }
    }
  `]
})
export class SideNavComponent {
  readonly navItems = MAIN_NAV_ITEMS;
  readonly extraItems = MAIN_NAV_ITEMS.filter(item => !['inicio', 'sucursales', 'empleados'].includes(item.id));

  readonly isMoreOpen = signal(false);
  readonly toastMessage = signal<string | null>(null);
  private toastTimeout?: ReturnType<typeof setTimeout>;

  toggleMoreMenu(): void {
    this.isMoreOpen.update(v => !v);
  }

  showComingSoon(feature: string): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastMessage.set(`${feature}: funcionalidad disponible próximamente`);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage.set(null);
    }, 2800);
  }
}
